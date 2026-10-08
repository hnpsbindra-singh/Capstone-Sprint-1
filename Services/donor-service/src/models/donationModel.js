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
      enum: ['PENDING', 'ACCEPTED', 'DISPATCHED', 'DELIVERED'],
      default: 'PENDING',
    },
    trackingNumber: {
      type: String,
      default: '',
      trim: true,
    },
    deliveryMethod: {
      type: String,
      enum: ['COURIER', 'SELF_DROPOFF', 'VOLUNTEER_FLEET'],
      default: 'COURIER',
    },
    carrier: {
      type: String,
      default: '',
      trim: true,
    },
    estimatedArrival: {
      type: String,
      default: '',
    },
    verificationCode: {
      type: String,
      default: '',
      trim: true,
    },
    dispatchedAt: {
      type: Number,
      default: null,
    },
    deliveredAt: {
      type: Number,
      default: null,
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
