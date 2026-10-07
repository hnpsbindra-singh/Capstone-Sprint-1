const Donation = require('../models/donationModel');
const ngoClient = require('../clients/ngoClient');
const victimClient = require('../clients/victimClient');
const emailService = require('./emailService');

class DonorService {
  /**
   * Get all open NGO requests
   */
  async getOpenRequests() {
    const allRequests = await ngoClient.getAllRequests();
    return allRequests.filter((r) => r.status !== 'COMPLETED');
  }

  /**
   * Create a donation for an NGO request and notify donor
   */
  async createDonation({ donorId, ngoRequestId, itemName, quantity }) {
    if (!itemName || !quantity || Number(quantity) <= 0) {
      const err = new Error('itemName and a positive quantity are required');
      err.statusCode = 400;
      throw err;
    }

    let ngoRequest;
    try {
      ngoRequest = await ngoClient.getRequestById(ngoRequestId);
    } catch (e) {
      const err = new Error('NGO Request Not Found');
      err.statusCode = 404;
      throw err;
    }

    if (ngoRequest.status === 'COMPLETED') {
      const err = new Error('Request already completed');
      err.statusCode = 400;
      throw err;
    }

    const remaining = ngoRequest.quantityNeeded - (ngoRequest.quantityReceived || 0);
    if (Number(quantity) > remaining) {
      const err = new Error('Donation exceeds required quantity');
      err.statusCode = 400;
      throw err;
    }

    const ngoTitle = ngoRequest.title || 'NGO Relief Operation';
    const ngoContactEmail = ngoRequest.contactEmail || ngoRequest.ngoId || 'support@resqflow.org';
    const ngoDeliveryAddress = ngoRequest.deliveryAddress || 'Designated Regional Relief Hub';
    const ngoContactPhone = ngoRequest.contactPhone || '';

    const donation = new Donation({
      donorId,
      ngoRequestId,
      itemName,
      quantity: Number(quantity),
      ngoTitle,
      ngoContactEmail,
      ngoDeliveryAddress,
      ngoContactPhone,
      status: 'PENDING',
      donatedAt: Date.now(),
    });

    const saved = await donation.save();

    // Async email notification to donor
    emailService
      .sendDonationConfirmationEmail(donorId, {
        itemName,
        quantity,
        ngoTitle,
        ngoDeliveryAddress,
        ngoContactEmail,
        ngoContactPhone,
      })
      .catch((e) => console.error('[Donor Email Async Error]', e.message));

    return {
      ...saved.toObject(),
      ngoTitle,
      ngoContactEmail,
      ngoDeliveryAddress,
      ngoContactPhone,
    };
  }

  /**
   * Fetch donations for the logged-in donor
   */
  async getMyDonations(donorId) {
    return Donation.find({ donorId }).sort({ donatedAt: -1 });
  }

  /**
   * Fetch regional flood heatmap from Victim Service
   */
  async getHeatmap() {
    return victimClient.getHeatmap();
  }

  /**
   * Inter-Service: Get donations by NGO request IDs and optional status
   */
  async getDonationsByRequestIds({ ngoRequestIds, status }) {
    const query = {};
    if (ngoRequestIds) {
      query.ngoRequestId = { $in: ngoRequestIds.split(',') };
    }
    query.status = status || 'PENDING';

    return Donation.find(query);
  }

  /**
   * Inter-Service: Get single donation by ID
   */
  async getDonationById(id) {
    const donation = await Donation.findById(id);
    if (!donation) {
      const err = new Error('Donation not found');
      err.statusCode = 404;
      throw err;
    }
    return donation;
  }

  /**
   * Inter-Service: Update donation status (ACCEPTED | DELIVERED)
   */
  async updateDonationStatus(id, status) {
    if (!['ACCEPTED', 'DELIVERED'].includes(status)) {
      const err = new Error('Invalid status. Must be ACCEPTED or DELIVERED');
      err.statusCode = 400;
      throw err;
    }

    const donation = await Donation.findByIdAndUpdate(id, { status }, { new: true });
    if (!donation) {
      const err = new Error('Donation not found');
      err.statusCode = 404;
      throw err;
    }
    return donation;
  }

  /**
   * Inter-Service: Get all donations (for Admin overview)
   */
  async getAllDonations() {
    return Donation.find();
  }
}

module.exports = new DonorService();
