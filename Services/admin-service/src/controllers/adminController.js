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

  async getDonors(req, res, next) {
    try {
      const donors = await adminService.getDonors();
      res.json(donors);
    } catch (err) {
      console.error('[Admin Donors]', err.message);
      res.status(500).json({ error: 'Could not fetch donors: ' + err.message });
    }
  }

  async getNgos(req, res, next) {
    try {
      const ngos = await adminService.getNgos();
      res.json(ngos);
    } catch (err) {
      console.error('[Admin NGOs]', err.message);
      res.status(500).json({ error: 'Could not fetch NGOs: ' + err.message });
    }
  }

  async getAdmins(req, res, next) {
    try {
      const admins = await adminService.getAdmins();
      res.json(admins);
    } catch (err) {
      console.error('[Admin Admins]', err.message);
      res.status(500).json({ error: 'Could not fetch admins: ' + err.message });
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { role } = req.query;
      const users = await adminService.getAllUsers(role);
      res.json(users);
    } catch (err) {
      console.error('[Admin Users]', err.message);
      res.status(500).json({ error: 'Could not fetch users: ' + err.message });
    }
  }

  async blockUser(req, res, next) {
    try {
      const isBlocked = req.body.isBlocked !== undefined ? req.body.isBlocked : true;
      if (req.user?.userId === req.params.id && isBlocked) {
        return res.status(400).json({ error: 'You cannot block your own admin account.' });
      }
      const result = await adminService.blockUser(req.params.id, isBlocked);
      res.json(result);
    } catch (err) {
      console.error('[Admin Block User]', err.message);
      const status = err.response?.status || 500;
      const message = err.response?.data?.error || err.message;
      res.status(status).json({ error: 'Could not update user block status: ' + message });
    }
  }

  async blockVictim(req, res, next) {
    return this.blockUser(req, res, next);
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

  async createAdmin(req, res, next) {
    try {
      const { name, username, password } = req.body;
      if (!name || !username || !password) {
        return res.status(400).json({ error: 'Name, email/username, and password are required' });
      }
      const result = await adminService.createAdmin({ name, username, password });
      res.status(201).json(result);
    } catch (err) {
      console.error('[Admin Create Admin]', err.message);
      const status = err.response?.status || err.statusCode || 500;
      const message = err.response?.data?.error || err.response?.data?.message || err.message;
      res.status(status).json({ error: 'Could not create administrator: ' + message });
    }
  }

  async approveNgo(req, res, next) {
    try {
      const isApproved = req.body.isApproved !== undefined ? req.body.isApproved : true;
      const result = await adminService.setNgoApprovalStatus(req.params.id, isApproved);
      res.json(result);
    } catch (err) {
      console.error('[Admin Approve NGO]', err.message);
      const status = err.response?.status || err.statusCode || 500;
      const message = err.response?.data?.error || err.response?.data?.message || err.message;
      res.status(status).json({ error: 'Could not update NGO approval status: ' + message });
    }
  }
}

module.exports = new AdminController();
