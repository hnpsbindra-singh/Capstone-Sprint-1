const ngoService = require('../services/ngoService');

class NgoController {
  async createRequest(req, res, next) {
    try {
      const saved = await ngoService.createRequest(req.body, req.user.username);
      res.status(201).json(saved);
    } catch (err) {
      next(err);
    }
  }

  async getMyRequests(req, res, next) {
    try {
      const requests = await ngoService.getMyRequests(req.user.username);
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }

  async getAvailableDonations(req, res, next) {
    try {
      const donations = await ngoService.getAvailableDonations(req.user.username);
      res.json(donations);
    } catch (err) {
      next(err);
    }
  }

  async acceptDonation(req, res, next) {
    try {
      const result = await ngoService.acceptDonation(req.params.id, req.user.username);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async markDelivered(req, res, next) {
    try {
      const verificationCode = req.body?.verificationCode || req.query?.verificationCode || '';
      const result = await ngoService.markDonationDelivered(req.params.id, req.user.username, verificationCode);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getHeatmap(req, res, next) {
    try {
      const heatmap = await ngoService.getHeatmap();
      res.json(heatmap);
    } catch (err) {
      next(err);
    }
  }

  // ─── Inter-Service Internal Endpoints ─────────────────────────────────────

  async getInternalRequests(req, res, next) {
    try {
      const requests = await ngoService.getAllRequests();
      res.json(requests);
    } catch (err) {
      next(err);
    }
  }

  async getInternalRequestById(req, res, next) {
    try {
      const request = await ngoService.getRequestById(req.params.id);
      res.json(request);
    } catch (err) {
      next(err);
    }
  }

  async updateInternalRequest(req, res, next) {
    try {
      const updated = await ngoService.updateRequest(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NgoController();
