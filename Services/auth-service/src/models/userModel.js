const mongoose = require('mongoose');

// Mirrors Spring Boot Users.java entity -> collection "Users"
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['VICTIM', 'DONOR', 'NGO', 'ADMIN'],
      required: true,
    },
    Isverified: {
      type: Boolean,
      default: false,
    },
    isBlockedFromReporting: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'Users',
    timestamps: false,
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
