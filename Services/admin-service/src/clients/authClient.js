const axios = require('axios');
const config = require('../config/env');

class AuthClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.services.authUrl,
      timeout: 10000,
    });
  }

  async getVictims() {
    const res = await this.client.get('/api/auth/internal/victims');
    return res.data;
  }

  async setVictimBlockStatus(victimId, isBlocked) {
    const res = await this.client.put(`/api/auth/internal/user/${victimId}/block-reporting`, {
      isBlocked,
    });
    return res.data;
  }
}

module.exports = new AuthClient();
