/**
 * Auth Service — Port 5001
 * Own DB: AuthServiceDB (MongoDB)
 * Collections: Users
 *
 * Endpoints:
 *  POST /api/auth/register           — OTP-based registration
 *  POST /api/auth/verify-otp         — OTP verification → saves user
 *  POST /api/auth/login              — Issues JWT (same secret/format as Spring Boot)
 *  POST /api/auth/send-otp           — Password reset OTP
 *  PUT  /api/auth/verify-reset-otp   — Verify reset OTP and update password
 */

require('dotenv').config();
const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const mongoose = require('mongoose');
const Redis   = require('ioredis');
const axios   = require('axios');

// ─── Config ──────────────────────────────────────────────────────────────────
const PORT       = process.env.PORT       || 5001;
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/AuthServiceDB';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXP    = process.env.JWT_EXP    || '24h';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] JWT_SECRET environment variable is not defined!');
}

// Redis Configuration (e.g. Upstash or local Redis)
const redisOptions = {
  host:     process.env.REDIS_HOST     || 'localhost',
  port:     Number(process.env.REDIS_PORT) || 6379,
  username: process.env.REDIS_USERNAME || 'default',
};

if (process.env.REDIS_PASSWORD) {
  redisOptions.password = process.env.REDIS_PASSWORD;
}

if (process.env.REDIS_TLS === 'true' || process.env.REDIS_HOST?.includes('upstash.io')) {
  redisOptions.tls = {};
}

const redis = new Redis(redisOptions);

redis.on('connect', () => console.log('[Redis] Connected successfully'));
redis.on('error',   (e) => console.error('[Redis] Error:', e.message));

// ─── Brevo Email ─────────────────────────────────────────────────────────────
const BREVO_API_KEY    = process.env.BREVO_API_KEY;
const BREVO_SENDER     = {
  name: process.env.BREVO_SENDER_NAME || 'ResQFlow',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@resqflow.org'
};

async function sendEmail(to, subject, htmlContent) {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: BREVO_SENDER,
      to: [{ email: to }],
      subject,
      htmlContent,
    }, { headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' } });
    console.log(`[Email] Sent "${subject}" → ${to}`);
  } catch (err) {
    console.error('[Email] Failed:', err.response?.data || err.message);
  }
}

async function sendWelcomeEmail(to, name) {
  await sendEmail(to, 'Welcome to ResQFlow', `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
      <h2 style="color:#1565C0">Welcome to ResQFlow, ${name}!</h2>
      <p>Your account has been successfully created and verified.</p>
      <p>You can now log in and start using the ResQFlow Flood Rescue System.</p>
      <p><strong>— The ResQFlow Team</strong></p>
    </div>`);
}

async function sendOtpEmail(to, otp) {
  await sendEmail(to, 'Your ResQFlow OTP Code', `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px">
      <h2 style="color:#1565C0">Your OTP Code</h2>
      <p>Your One Time Password for ResQFlow is:</p>
      <div style="background:#f4f4f4;padding:16px;text-align:center;border-radius:8px;margin:16px 0">
        <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1565C0">${otp}</span>
      </div>
      <p style="color:#e53935"><strong>Valid for 5 minutes only.</strong></p>
    </div>`);
}

// ─── Mongoose Schema ──────────────────────────────────────────────────────────
// Mirrors Spring Boot Users.java → collection "Users" in AuthServiceDB
const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  username:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['VICTIM', 'DONOR', 'NGO', 'ADMIN'], required: true },
  Isverified:  { type: Boolean, default: false },
  isBlockedFromReporting: { type: Boolean, default: false },
}, { collection: 'Users', timestamps: false });

const User = mongoose.model('User', userSchema);

// ─── JWT Middleware ───────────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Missing Authorization header' });
  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET, { algorithms: ['HS256'] });
    req.user = { username: decoded.sub, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─── Express App ─────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Helper ────────────────────────────────────────────────────────────────────
function generateOtp() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Mirrors Spring Boot: ProfileService.register()
 * - Validates user doesn't exist
 * - Generates 6-digit OTP, stores in Redis (5 min TTL)
 * - Temporarily stores registration data in Redis
 * - Sends OTP email via Brevo
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    if (!name || !username || !password || !role)
      return res.status(400).json({ error: 'name, username, password, role are required' });

    const cleanUsername = username.toLowerCase().trim();

    const exists = await User.exists({ username: cleanUsername });
    if (exists) return res.status(409).json({ error: 'User already exists' });

    const otp          = generateOtp();
    const hashedPass   = await bcrypt.hash(password, 10);
    const pendingUser  = { name, username: cleanUsername, password: hashedPass, role };

    // Store OTP and pending user data in Redis (5 min TTL = 300 seconds)
    await redis.set(`user: ${cleanUsername}`, otp, 'EX', 300);
    await redis.set(`userObject: ${cleanUsername}`, JSON.stringify(pendingUser), 'EX', 300);

    console.log(`[Auth] OTP for ${cleanUsername}: ${otp}`);
    await sendOtpEmail(cleanUsername, otp);

    res.json('Otp Sent Successfully');
  } catch (err) {
    console.error('[Register]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/verify-otp
 * Mirrors Spring Boot: ProfileService.verify()
 * - Reads pending user and OTP from Redis
 * - Validates OTP, saves verified user to MongoDB
 * - Sends welcome email
 */
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { username, otp } = req.query;
    if (!username || !otp) return res.status(400).json({ error: 'username and otp query params required' });

    const cleanUsername = username.toLowerCase().trim();

    const [storedOtp, pendingUserJson] = await Promise.all([
      redis.get(`user: ${cleanUsername}`),
      redis.get(`userObject: ${cleanUsername}`),
    ]);

    if (!storedOtp)       return res.status(400).json({ error: 'OTP expired.' });
    if (storedOtp !== otp) return res.status(400).json({ error: 'Invalid OTP.' });
    if (!pendingUserJson)  return res.status(400).json({ error: 'Registration expired.' });

    const pendingUser = JSON.parse(pendingUserJson);

    // Re-check if user was somehow created concurrently
    const alreadyExists = await User.exists({ username: cleanUsername });
    if (alreadyExists) return res.status(409).json({ error: 'User already exists.' });

    const user = new User({ ...pendingUser, Isverified: true });
    await user.save();

    // Clean up Redis keys
    await Promise.all([
      redis.del(`user: ${cleanUsername}`),
      redis.del(`userObject: ${cleanUsername}`),
    ]);

    await sendWelcomeEmail(cleanUsername, pendingUser.name);
    res.json('Registration Successful');
  } catch (err) {
    console.error('[Verify OTP]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Mirrors Spring Boot: ProfileService.login()
 * - Authenticates username + password
 * - Issues JWT with { sub: username, role: role } (same format as Spring Boot JwtUtils.generateToken)
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });

    const cleanUsername = username.toLowerCase().trim();
    const user = await User.findOne({ username: cleanUsername });

    if (!user)             return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.Isverified)  return res.status(403).json({ error: 'Account not verified. Please verify OTP first.' });

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid)    return res.status(401).json({ error: 'Invalid credentials' });

    // Mirrors Spring Boot: .setSubject(username).claim("role", role.name()).claim("userId", id)
    const token = jwt.sign(
      { role: user.role, userId: user._id.toString() },
      JWT_SECRET,
      { subject: user.username, algorithm: 'HS256', expiresIn: JWT_EXP }
    );

    res.json(token);
  } catch (err) {
    console.error('[Login]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/auth/send-otp
 * Mirrors Spring Boot: ProfileService.sendOtp()
 * - Generates password reset OTP, stores in Redis under "username:<email>" key
 */
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'username query param required' });

    const cleanUsername = username.toLowerCase().trim();
    const userExists = await User.exists({ username: cleanUsername });
    if (!userExists) return res.status(404).json({ error: 'User not found' });

    const otp = generateOtp();
    await redis.set(`username:${cleanUsername}`, otp, 'EX', 300);
    console.log(`[Auth] Reset OTP for ${cleanUsername}: ${otp}`);
    await sendOtpEmail(cleanUsername, otp);

    res.json('Otp Sent Successfully');
  } catch (err) {
    console.error('[Send OTP]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/verify-reset-otp
 * Mirrors Spring Boot: ProfileService.verifyPassword()
 * - Validates reset OTP from Redis
 * - Updates password with bcrypt hash
 */
app.put('/api/auth/verify-reset-otp', async (req, res) => {
  try {
    const { username, OTP: otp, newpassword } = req.body;
    if (!username || !otp || !newpassword)
      return res.status(400).json({ error: 'username, OTP, and newpassword are required' });

    const cleanUsername = username.toLowerCase().trim();
    const storedOtp = await redis.get(`username:${cleanUsername}`);

    if (!storedOtp)        return res.status(400).json({ error: 'OTP expired.' });
    if (storedOtp !== otp) return res.status(400).json({ error: 'Invalid OTP.' });

    const hashedPassword = await bcrypt.hash(newpassword, 10);
    const result = await User.updateOne({ username: cleanUsername }, { password: hashedPassword });

    if (result.modifiedCount === 0) return res.status(400).json({ error: 'Password update failed' });

    await redis.del(`username:${cleanUsername}`);
    res.json('Password updated successfully');
  } catch (err) {
    console.error('[Reset Password]', err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/internal/user/:username
 * Internal endpoint for inter-service communication (Feign client equivalent)
 * Other services call this to look up a user's email or ID
 */
app.get('/api/auth/internal/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/internal/user-by-id/:id
 */
app.get('/api/auth/internal/user-by-id/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/auth/internal/victims
 * Fetches all registered victims for admin management
 */
app.get('/api/auth/internal/victims', async (req, res) => {
  try {
    const victims = await User.find({ role: 'VICTIM' }).select('-password');
    res.json(victims);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/auth/internal/user/:id/block-reporting
 * Blocks or unblocks a victim from reporting floods
 */
app.put('/api/auth/internal/user/:id/block-reporting', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const shouldBlock = isBlocked !== undefined ? Boolean(isBlocked) : true;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlockedFromReporting: shouldBlock },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      message: `User reporting status successfully updated to: ${shouldBlock ? 'BLOCKED' : 'UNBLOCKED'}`,
      user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'UP', service: 'auth-service', port: PORT }));

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message });
});

// ─── Start ─────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('[Auth Service] MongoDB connected to AuthServiceDB');
    app.listen(PORT, () => console.log(`[Auth Service] Running on port ${PORT}`));
  })
  .catch(err => {
    console.error('[Auth Service] MongoDB connection failed:', err.message);
    process.exit(1);
  });
