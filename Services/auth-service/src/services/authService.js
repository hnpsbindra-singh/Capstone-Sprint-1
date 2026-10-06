const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const redis = require('../config/redis');
const config = require('../config/env');
const emailService = require('./emailService');

function generateOtp() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

class AuthService {
  /**
   * Register pending user and dispatch OTP
   */
  async register({ name, username, password, role }) {
    if (!name || !username || !password || !role) {
      const err = new Error('name, username, password, and role are required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.toLowerCase().trim();
    const exists = await User.exists({ username: cleanUsername });
    if (exists) {
      const err = new Error('User already exists');
      err.statusCode = 409;
      throw err;
    }

    const otp = generateOtp();
    const hashedPass = await bcrypt.hash(password, 10);
    const pendingUser = { name, username: cleanUsername, password: hashedPass, role };

    // Store OTP and pending user in Redis with 5 min (300s) TTL
    await redis.set(`user: ${cleanUsername}`, otp, 'EX', 300);
    await redis.set(`userObject: ${cleanUsername}`, JSON.stringify(pendingUser), 'EX', 300);

    console.log(`[Auth] OTP generated for ${cleanUsername}: ${otp}`);
    await emailService.sendOtpEmail(cleanUsername, otp);

    return 'Otp Sent Successfully';
  }

  /**
   * Verify registration OTP and save user in DB
   */
  async verifyOtp({ username, otp }) {
    if (!username || !otp) {
      const err = new Error('username and otp query params required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.toLowerCase().trim();
    const [storedOtp, pendingUserJson] = await Promise.all([
      redis.get(`user: ${cleanUsername}`),
      redis.get(`userObject: ${cleanUsername}`),
    ]);

    if (!storedOtp) {
      const err = new Error('OTP expired.');
      err.statusCode = 400;
      throw err;
    }

    if (storedOtp !== otp) {
      const err = new Error('Invalid OTP.');
      err.statusCode = 400;
      throw err;
    }

    if (!pendingUserJson) {
      const err = new Error('Registration expired.');
      err.statusCode = 400;
      throw err;
    }

    const pendingUser = JSON.parse(pendingUserJson);

    // Guard against race conditions
    const alreadyExists = await User.exists({ username: cleanUsername });
    if (alreadyExists) {
      const err = new Error('User already exists.');
      err.statusCode = 409;
      throw err;
    }

    const user = new User({ ...pendingUser, Isverified: true });
    await user.save();

    // Clean up Redis keys
    await Promise.all([
      redis.del(`user: ${cleanUsername}`),
      redis.del(`userObject: ${cleanUsername}`),
    ]);

    await emailService.sendWelcomeEmail(cleanUsername, pendingUser.name);
    return 'Registration Successful';
  }

  /**
   * Authenticate user credentials and return signed JWT
   */
  async login({ username, password }) {
    if (!username || !password) {
      const err = new Error('username and password required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.toLowerCase().trim();
    const user = await User.findOne({ username: cleanUsername });

    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    if (!user.Isverified) {
      const err = new Error('Account not verified. Please verify OTP first.');
      err.statusCode = 403;
      throw err;
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    // Spring Boot JwtUtils claim format
    const token = jwt.sign(
      { role: user.role, userId: user._id.toString() },
      config.jwt.secret,
      { subject: user.username, algorithm: 'HS256', expiresIn: config.jwt.expiresIn }
    );

    return token;
  }

  /**
   * Send password reset OTP
   */
  async sendResetOtp(username) {
    if (!username) {
      const err = new Error('username query param required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.toLowerCase().trim();
    const userExists = await User.exists({ username: cleanUsername });
    if (!userExists) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    const otp = generateOtp();
    await redis.set(`username:${cleanUsername}`, otp, 'EX', 300);
    console.log(`[Auth] Password reset OTP for ${cleanUsername}: ${otp}`);

    await emailService.sendOtpEmail(cleanUsername, otp);
    return 'Otp Sent Successfully';
  }

  /**
   * Verify password reset OTP and update password
   */
  async verifyResetOtp({ username, otp, newpassword }) {
    if (!username || !otp || !newpassword) {
      const err = new Error('username, OTP, and newpassword are required');
      err.statusCode = 400;
      throw err;
    }

    const cleanUsername = username.toLowerCase().trim();
    const storedOtp = await redis.get(`username:${cleanUsername}`);

    if (!storedOtp) {
      const err = new Error('OTP expired.');
      err.statusCode = 400;
      throw err;
    }

    if (storedOtp !== otp) {
      const err = new Error('Invalid OTP.');
      err.statusCode = 400;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    const result = await User.updateOne({ username: cleanUsername }, { password: hashedPassword });

    if (result.modifiedCount === 0) {
      const err = new Error('Password update failed');
      err.statusCode = 400;
      throw err;
    }

    await redis.del(`username:${cleanUsername}`);
    return 'Password updated successfully';
  }

  /**
   * Inter-service lookup: Get user by username without password
   */
  async getUserByUsername(username) {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  /**
   * Inter-service lookup: Get user by MongoDB ID without password
   */
  async getUserById(id) {
    const user = await User.findById(id).select('-password');
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  /**
   * Inter-service lookup: Get all victims without password
   */
  async getVictims() {
    return User.find({ role: 'VICTIM' }).select('-password');
  }

  /**
   * Inter-service: Block or unblock a victim from flood reporting
   */
  async setVictimReportingBlock(id, isBlocked) {
    const shouldBlock = isBlocked !== undefined ? Boolean(isBlocked) : true;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlockedFromReporting: shouldBlock },
      { new: true }
    ).select('-password');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return {
      message: `User reporting status successfully updated to: ${shouldBlock ? 'BLOCKED' : 'UNBLOCKED'}`,
      user,
    };
  }
}

module.exports = new AuthService();
