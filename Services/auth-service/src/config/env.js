const path = require('path');
const dotenv = require('dotenv');

// Load local .env, with fallback to root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

let redisHost = process.env.REDIS_HOST || 'localhost';
let redisPort = parseInt(process.env.REDIS_PORT, 10) || 6379;
let redisPassword = process.env.REDIS_PASSWORD || process.env.UPSTASH_REDIS_REST_TOKEN || undefined;
let isTls = process.env.REDIS_TLS === 'true' || Boolean(process.env.UPSTASH_REDIS_REST_URL);

if (process.env.UPSTASH_REDIS_REST_URL) {
  try {
    const parsed = new URL(process.env.UPSTASH_REDIS_REST_URL);
    redisHost = parsed.hostname;
    isTls = true;
  } catch (e) {
    // ignore parse error and keep redisHost
  }
}

if (redisHost.includes('upstash.io')) {
  isTls = true;
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  mongoUri: process.env.MONGO_URI || process.env.AUTH_MONGO_URI || 'mongodb://localhost:27017/AuthServiceDB',
  jwt: {
    secret: process.env.JWT_SECRET || 'IAmSonOfGurvinderSinghWithNameHarnimarPreetSinghAge19AndSexMaleWantingAFemale',
    expiresIn: process.env.JWT_EXP || '24h',
  },
  redis: {
    host: redisHost,
    port: redisPort,
    username: process.env.REDIS_USERNAME || 'default',
    password: redisPassword,
    tls: isTls ? {} : undefined,
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'hnps.bindra@gmail.com',
    senderName: process.env.BREVO_SENDER_NAME || 'ResQFlow',
  },
};

// Validate critical secrets
if (!config.jwt.secret) {
  console.warn('[SECURITY WARNING] JWT_SECRET is not configured for auth-service!');
}

module.exports = Object.freeze(config);
