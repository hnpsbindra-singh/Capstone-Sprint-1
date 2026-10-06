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

  async blockReporting(req, res, next) {
    try {
      const { isBlocked } = req.body;
      const result = await authService.setVictimReportingBlock(req.params.id, isBlocked);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
