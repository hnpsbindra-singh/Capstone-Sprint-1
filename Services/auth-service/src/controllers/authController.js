const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { username, otp } = req.query;
      const result = await authService.verifyOtp({ username, otp });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const token = await authService.login({ username, password });
      res.json(token);
    } catch (err) {
      next(err);
    }
  }

  async sendResetOtp(req, res, next) {
    try {
      const { username } = req.query;
      const result = await authService.sendResetOtp(username);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyResetOtp(req, res, next) {
    try {
      const { username, OTP: otp, newpassword } = req.body;
      const result = await authService.verifyResetOtp({ username, otp, newpassword });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // ─── Inter-Service Internal Endpoints ─────────────────────────────────────

  async getUserByUsername(req, res, next) {
    try {
      const user = await authService.getUserByUsername(req.params.username);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await authService.getUserById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getVictims(req, res, next) {
    try {
      const victims = await authService.getVictims();
      res.json(victims);
    } catch (err) {
      next(err);
    }
  }

  async getDonors(req, res, next) {
    try {
      const donors = await authService.getDonors();
      res.json(donors);
    } catch (err) {
      next(err);
    }
  }

  async getNgos(req, res, next) {
    try {
      const ngos = await authService.getNgos();
      res.json(ngos);
    } catch (err) {
      next(err);
    }
  }

  async getAdmins(req, res, next) {
    try {
      const admins = await authService.getAdmins();
      res.json(admins);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req, res, next) {
    try {
      const { role } = req.query;
      const users = await authService.getAllUsers(role);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async blockUser(req, res, next) {
    try {
      const { isBlocked } = req.body;
      const result = await authService.setUserBlockStatus(req.params.id, isBlocked);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async blockReporting(req, res, next) {
    try {
      const { isBlocked } = req.body;
      const result = await authService.setUserBlockStatus(req.params.id, isBlocked);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async createAdmin(req, res, next) {
    try {
      const result = await authService.createAdmin(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async setNgoApproval(req, res, next) {
    try {
      const { isApproved } = req.body;
      const result = await authService.setNgoApprovalStatus(req.params.id, isApproved);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getMe(req.user?.userId, req.user?.username);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
