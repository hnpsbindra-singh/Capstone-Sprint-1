const adminService = require('../services/adminService');

class AdminController {
  async getReports(req, res, next) {
    try {
      const reports = await adminService.getReports();
      res.json(reports);
    } catch (err) {
      console.error('[Admin Reports] Victim Service unavailable:', err.message);
      res.status(503).json({ error: 'Victim Service unavailable: ' + err.message });
    }
  }

  async getHeatmap(req, res, next) {
    try {
      const heatmap = await adminService.getHeatmap();
      res.json(heatmap);
    } catch (err) {
      console.error('[Admin Heatmap] Victim Service unavailable:', err.message);
      res.status(503).json({ error: 'Victim Service unavailable: ' + err.message });
    }
  }

  async getNgoRequests(req, res, next) {
    try {
      const requests = await adminService.getNgoRequests();
      res.json(requests);
    } catch (err) {
      console.error('[Admin NGO Requests]', err.message);
      res.status(500).json({ error: 'Could not fetch NGO requests: ' + err.message });
    }
  }

  async getDonations(req, res, next) {
    try {
      const donations = await adminService.getDonations();
      res.json(donations);
    } catch (err) {
      console.error('[Admin Donations]', err.message);
      res.status(500).json({ error: 'Could not fetch donations: ' + err.message });
    }
  }

  async getVictims(req, res, next) {
    try {
      const victims = await adminService.getVictims();
      res.json(victims);
    } catch (err) {
      console.error('[Admin Victims]', err.message);
      res.status(500).json({ error: 'Could not fetch victims: ' + err.message });
    }
  }

  async blockVictim(req, res, next) {
    try {
      const isBlocked = req.body.isBlocked !== undefined ? req.body.isBlocked : true;
      const result = await adminService.blockVictim(req.params.id, isBlocked);
      res.json(result);
    } catch (err) {
      console.error('[Admin Block Victim]', err.message);
      const status = err.response?.status || 500;
      const message = err.response?.data?.error || err.message;
      res.status(status).json({ error: 'Could not update victim block status: ' + message });
    }
  }

  async softDeleteReport(req, res, next) {
    try {
      const result = await adminService.softDeleteReport(req.params.id);
      res.json({ message: 'Flood report soft-deleted successfully', report: result });
    } catch (err) {
      console.error('[Admin Soft Delete Report]', err.message);
      const status = err.response?.status || 500;
      const message = err.response?.data?.error || err.message;
      res.status(status).json({ error: 'Could not delete flood report: ' + message });
    }
  }
}

module.exports = new AdminController();
