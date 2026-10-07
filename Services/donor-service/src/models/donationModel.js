const mongoose = require('mongoose');

// Donation mirrors Spring Boot Donation.java -> collection "Donations"
const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: String,
      required: true,
      trim: true,
    },
    ngoRequestId: {
      type: String,
      required: true,
      trim: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    ngoTitle: {
      type: String,
      default: '',
    },
    ngoContactEmail: {
      type: String,
      default: '',
    },
    ngoDeliveryAddress: {
      type: String,
      default: '',
    },
    ngoContactPhone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DELIVERED'],
      default: 'PENDING',
    },
    donatedAt: {
      type: Number,
      default: () => Date.now(),
    },
  },
  {
    collection: 'Donations',
    timestamps: false,
  }
);

donationSchema.index({ donorId: 1, donatedAt: -1 });
donationSchema.index({ ngoRequestId: 1, status: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
