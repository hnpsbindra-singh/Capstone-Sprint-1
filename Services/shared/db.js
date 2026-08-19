// Shared MongoDB connection using Mongoose
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/CapstoneDB';

let isConnected = false;

async function connect() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[DB] Connected to MongoDB:', MONGO_URI);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connect, mongoose };
