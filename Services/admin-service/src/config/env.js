const path = require('path');
const dotenv = require('dotenv');

// Load local .env, with fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5004,
  mongoUri: process.env.MONGO_URI || process.env.ADMIN_MONGO_URI || 'mongodb://localhost:27017/AdminServiceDB',
  jwt: {
    secret: process.env.JWT_SECRET || 'IAmSonOfGurvinderSinghWithNameHarnimarPreetSinghAge19AndSexMaleWantingAFemale',
  },
  services: {
    authUrl: process.env.AUTH_URL || 'http://localhost:5001',
    ngoUrl: process.env.NGO_URL || 'https://ngoservice.vercel.app',
    donorUrl: process.env.DONOR_URL || 'https://donorservice.vercel.app',
    victimUrl: process.env.VICTIM_URL || 'https://victim-service-latest.onrender.com',
  },
};

// Validate critical secrets
if (!config.jwt.secret) {
  console.warn('[SECURITY WARNING] JWT_SECRET is not configured for admin-service!');
}

module.exports = Object.freeze(config);
