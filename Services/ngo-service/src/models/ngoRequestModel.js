const mongoose = require('mongoose');

// NgoRequest mirrors Spring Boot NgoRequest.java -> collection "ResourceRequest"
const ngoRequestSchema = new mongoose.Schema(
  {
    ngoId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    resourceNeeded: {
      type: String,
      required: true,
      trim: true,
    },
    quantityNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    quantityReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['OPEN', 'COMPLETED'],
      default: 'OPEN',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  {
    collection: 'ResourceRequest',
    timestamps: false,
  }
);

ngoRequestSchema.index({ location: '2dsphere' });
ngoRequestSchema.index({ ngoId: 1 });
ngoRequestSchema.index({ status: 1 });

const NgoRequest = mongoose.model('NgoRequest', ngoRequestSchema);

module.exports = NgoRequest;
