const axios = require('axios');
const config = require('../config/env');

class AuthClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.services.authUrl,
      timeout: 10000,
    });
  }

  async getUserByUsername(username) {
    const res = await this.client.get(`/api/auth/internal/user/${username}`);
    return res.data;
  }
}

module.exports = new AuthClient();
