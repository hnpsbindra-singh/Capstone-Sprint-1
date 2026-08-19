import API from './axios';

/**
 * Register a new user.
 * Backend: POST /api/auth/register
 * Body: { name, username, password, role }
 * - Backend sends welcome email + OTP email
 * - Stores OTP in Redis for 5 minutes
 * - Returns plain string: "Otp Sent Successfully"
 */
export const register = async (name, username, password, role) => {
  const response = await API.post('/api/auth/register', {
    name,
    username,
    password,
    role,
  });
  return response.data;
};

/**
 * Verify registration OTP.
 * Backend: POST /api/auth/verify-otp?username=&otp=
 * - Validates OTP from Redis, saves user to DB
 * - Returns plain string: "Registration Successful"
 */
export const verifyOtp = async (username, otp) => {
  const response = await API.post('/api/auth/verify-otp', null, {
    params: { username, otp },
  });
  return response.data;
};

/**
 * Login with username and password.
 * Backend: POST /api/auth/login
 * Body: { username, password }
 * - Returns JWT token string
 */
export const login = async (username, password) => {
  const response = await API.post('/api/auth/login', {
    username,
    password,
  });
  return response.data;
};

/**
 * Send a password reset OTP.
 * Backend: POST /api/auth/send-otp?username=
 * - Generates OTP, stores in Redis (key: "username:<email>") for 5 min
 * - Sends OTP via email
 * - Returns plain string: "Otp Sent Successfully"
 */
export const sendResetOtp = async (username) => {
  const response = await API.post('/api/auth/send-otp', null, {
    params: { username },
  });
  return response.data;
};

/**
 * Verify reset OTP and update password.
 * Backend: PUT /api/auth/verify-reset-otp
 * Body: { username, OTP, newpassword }
 * - Validates OTP, updates hashed password in DB
 * - Returns plain string: "Password updated successfully"
 */
export const resetPassword = async (username, otp, newpassword) => {
  const response = await API.put('/api/auth/verify-reset-otp', {
    username,
    OTP: otp,
    newpassword,
  });
  return response.data;
};
