const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[Admin Service DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[Admin Service DB] Connection error:', err.message);
    throw err;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[Admin Service DB] MongoDB disconnected');
  isConnected = false;
});

module.exports = { connectDB, mongoose };
