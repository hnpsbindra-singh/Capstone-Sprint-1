const NgoRequest = require('../models/ngoRequestModel');
const donorClient = require('../clients/donorClient');
const authClient = require('../clients/authClient');
const victimClient = require('../clients/victimClient');
const emailService = require('./emailService');

class NgoService {
  /**
   * Create a new NGO resource relief request
   */
  async createRequest(
    {
      title,
      description,
      resourceNeeded,
      quantityNeeded,
      latitude,
      longitude,
      deliveryAddress,
      contactEmail,
      contactPhone,
    },
    ngoId
  ) {
    if (!title || !resourceNeeded || !quantityNeeded || latitude == null || longitude == null) {
      const err = new Error('title, resourceNeeded, quantityNeeded, latitude, longitude required');
      err.statusCode = 400;
      throw err;
    }

    const reqLat = Number(latitude);
    const reqLon = Number(longitude);

    // Enforce that requests can only be created for verified flood hazard areas
    let activeFloodZones = [];
    try {
      activeFloodZones = await victimClient.getHeatmap();
    } catch (fetchErr) {
      console.warn('[NGO Service] Warning: Failed to query victim service heatmap:', fetchErr.message);
    }

    if (Array.isArray(activeFloodZones) && activeFloodZones.length > 0) {
      const MAX_DISTANCE_KM = 30; // Radius within which request is valid
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const matchedZone = activeFloodZones.find(zone => {
        const d = calculateDistance(reqLat, reqLon, zone.latitude, zone.longitude);
        return d <= MAX_DISTANCE_KM && Number(zone.averageSeverity || zone.severityScore || 0) > 2;
      });

      if (!matchedZone) {
        const err = new Error('Resource requests are strictly permitted only for verified active flood areas. Please select a flood zone from the disaster heatmap.');
        err.statusCode = 400;
        throw err;
      }
    }

    const ngoRequest = new NgoRequest({
      ngoId,
      title,
      description: description || '',
      resourceNeeded,
      quantityNeeded: Number(quantityNeeded),
      quantityReceived: 0,
      deliveryAddress: deliveryAddress?.trim() || 'Central NGO Regional Camp',
      contactEmail: contactEmail?.trim() || ngoId,
      contactPhone: contactPhone?.trim() || '',
      status: 'OPEN',
      location: {
        type: 'Point',
        coordinates: [reqLon, reqLat],
      },
    });

    return ngoRequest.save();
  }

  /**
   * Get all requests created by the authenticated NGO
   */
  async getMyRequests(ngoId) {
    return NgoRequest.find({ ngoId });
  }

  /**
   * Get pending donations matching this NGO's requests
   */
  async getAvailableDonations(ngoId) {
    const myRequests = await NgoRequest.find({ ngoId });
    if (!myRequests.length) return [];

    const requestIds = myRequests.map((r) => r._id.toString());
    return donorClient.getDonationsForRequests(requestIds);
  }

  /**
   * Accept a pending donation, update quantityReceived, and notify donor
   */
  async acceptDonation(donationId, ngoId) {
    const donation = await donorClient.getDonationById(donationId);
    if (!donation) {
      const err = new Error('Donation not found');
      err.statusCode = 404;
      throw err;
    }

    const ngoRequest = await NgoRequest.findById(donation.ngoRequestId);
    if (!ngoRequest) {
      const err = new Error('NGO Request not found');
      err.statusCode = 404;
      throw err;
    }

    if (ngoRequest.ngoId !== ngoId) {
      const err = new Error('Invalid Access: You do not own this request');
      err.statusCode = 403;
      throw err;
    }

    if (donation.status !== 'PENDING') {
      const err = new Error('Donation must be in pending queue first');
      err.statusCode = 400;
      throw err;
    }

    const remaining = ngoRequest.quantityNeeded - (ngoRequest.quantityReceived || 0);
    if (donation.quantity > remaining) {
      const err = new Error('Donation exceeds required quantity');
      err.statusCode = 400;
      throw err;
    }

    const updatedQty = (ngoRequest.quantityReceived || 0) + donation.quantity;
    ngoRequest.quantityReceived = updatedQty;
    if (updatedQty >= ngoRequest.quantityNeeded) {
      ngoRequest.status = 'COMPLETED';
    }
    await ngoRequest.save();

    // Update status in Donor Service
    await donorClient.updateDonationStatus(donationId, { status: 'ACCEPTED' });

    // Send acceptance email
    authClient
      .getUserByUsername(donation.donorId)
      .then((donorUser) => {
        if (donorUser?.username) {
          return emailService.sendAcceptanceEmail(donorUser.username);
        }
      })
      .catch((e) => console.error('[NGO Accept Email Error]', e.message));

    return { message: 'Donation accepted successfully' };
  }

  /**
   * Mark an accepted donation as DELIVERED and notify donor
   */
  async markDonationDelivered(donationId, ngoId) {
    const donation = await donorClient.getDonationById(donationId);
    if (!donation) {
      const err = new Error('Donation not found');
      err.statusCode = 404;
      throw err;
    }

    const ngoRequest = await NgoRequest.findById(donation.ngoRequestId);
    if (!ngoRequest) {
      const err = new Error('NGO Request not found');
      err.statusCode = 404;
      throw err;
    }

    if (ngoRequest.ngoId !== ngoId) {
      const err = new Error('Invalid Access: You do not own this request');
      err.statusCode = 403;
      throw err;
    }

    if (donation.status !== 'ACCEPTED') {
      const err = new Error('Donation must be accepted first');
      err.statusCode = 400;
      throw err;
    }

    await donorClient.updateDonationStatus(donationId, { status: 'DELIVERED' });

    // Send delivered email
    authClient
      .getUserByUsername(donation.donorId)
      .then((donorUser) => {
        if (donorUser?.username) {
          return emailService.sendDeliveredEmail(donorUser.username);
        }
      })
      .catch((e) => console.error('[NGO Deliver Email Error]', e.message));

    return { message: 'Donation marked as delivered' };
  }

  /**
   * Fetch regional flood heatmap from Victim Service
   */
  async getHeatmap() {
    return victimClient.getHeatmap();
  }

  // ─── Inter-Service Internal Endpoints ─────────────────────────────────────

  async getAllRequests() {
    return NgoRequest.find();
  }

  async getRequestById(id) {
    const request = await NgoRequest.findById(id);
    if (!request) {
      const err = new Error('Not found');
      err.statusCode = 404;
      throw err;
    }
    return request;
  }

  async updateRequest(id, payload) {
    const updated = await NgoRequest.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) {
      const err = new Error('Not found');
      err.statusCode = 404;
      throw err;
    }
    return updated;
  }
}

module.exports = new NgoService();
