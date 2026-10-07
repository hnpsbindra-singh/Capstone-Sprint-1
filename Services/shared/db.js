// Shared MongoDB connection using Mongoose
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/CapstoneDB';

let isConnected = false;

async function connect(uri = MONGO_URI) {
  if (isConnected) return;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('[Shared DB] Connected to MongoDB:', uri);
    return conn;
  } catch (err) {
    console.error('[Shared DB] Connection failed:', err.message);
    throw err;
  }
}

module.exports = { connect, mongoose };
