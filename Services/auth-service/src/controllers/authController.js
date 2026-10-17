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
      const username = req.query?.username || req.body?.username;
      const otp = req.query?.otp || req.query?.OTP || req.body?.otp || req.body?.OTP;
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

  async sendOtp(req, res, next) {
    try {
      const username = req.query?.username || req.body?.username;
      const result = await authService.sendResetOtp(username);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async sendResetOtp(req, res, next) {
    return this.sendOtp(req, res, next);
  }

  async verifyResetOtp(req, res, next) {
    try {
      const username = req.body?.username || req.query?.username;
      const otp = req.body?.OTP || req.body?.otp || req.query?.OTP || req.query?.otp;
      const newpassword = req.body?.newpassword || req.body?.newPassword || req.query?.newpassword || req.query?.newPassword;
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
