const path = require('path');
const dotenv = require('dotenv');

// Load local .env, with fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5003,
  mongoUri: process.env.MONGO_URI || process.env.DONOR_MONGO_URI || 'mongodb://localhost:27017/DonorServiceDB',
  jwt: {
    secret: process.env.JWT_SECRET || 'IAmSonOfGurvinderSinghWithNameHarnimarPreetSinghAge19AndSexMaleWantingAFemale',
  },
  services: {
    ngoUrl: process.env.NGO_URL || 'https://ngoservice.vercel.app',
    victimUrl: process.env.VICTIM_URL || 'https://victim-service-latest.onrender.com',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'hnps.bindra@gmail.com',
    senderName: process.env.BREVO_SENDER_NAME || 'ResQFlow Relief Network',
  },
};

// Validate critical secrets
if (!config.jwt.secret) {
  console.warn('[SECURITY WARNING] JWT_SECRET is not configured for donor-service!');
}

module.exports = Object.freeze(config);
