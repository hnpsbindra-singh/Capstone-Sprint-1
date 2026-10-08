const donorService = require('../services/donorService');

class DonorController {
  async getOpenRequests(req, res, next) {
    try {
      const requests = await donorService.getOpenRequests();
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }

  async donate(req, res, next) {
    try {
      const { ngoRequestId } = req.params;
      const { itemName, quantity } = req.body;
      const donation = await donorService.createDonation({
        donorId: req.user.username,
        ngoRequestId,
        itemName,
        quantity,
      });
      res.status(201).json(donation);
    } catch (err) {
      next(err);
    }
  }

  async dispatch(req, res, next) {
    try {
      const { id } = req.params;
      const { trackingNumber, deliveryMethod, carrier, estimatedArrival } = req.body;
      const updated = await donorService.dispatchDonation(id, req.user.username, {
        trackingNumber,
        deliveryMethod,
        carrier,
        estimatedArrival,
      });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async getMyDonations(req, res, next) {
    try {
      const donations = await donorService.getMyDonations(req.user.username);
      res.json(donations);
    } catch (err) {
      next(err);
    }
  }

  async getHeatmap(req, res, next) {
    try {
      const heatmap = await donorService.getHeatmap();
      res.json(heatmap);
    } catch (err) {
      next(err);
    }
  }

  // ─── Inter-Service Internal Endpoints ─────────────────────────────────────

  async getInternalDonations(req, res, next) {
    try {
      const { ngoRequestIds, status } = req.query;
      const donations = await donorService.getDonationsByRequestIds({ ngoRequestIds, status });
      res.json(donations);
    } catch (err) {
      next(err);
    }
  }

  async getInternalDonationById(req, res, next) {
    try {
      const donation = await donorService.getDonationById(req.params.id);
      res.json(donation);
    } catch (err) {
      next(err);
    }
  }

  async updateInternalDonationStatus(req, res, next) {
    try {
      const { status } = req.body;
      const donation = await donorService.updateDonationStatus(req.params.id, status);
      res.json(donation);
    } catch (err) {
      next(err);
    }
  }

  async getInternalAllDonations(req, res, next) {
    try {
      const donations = await donorService.getAllDonations();
      res.json(donations);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new DonorController();
