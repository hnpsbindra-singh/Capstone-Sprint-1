const axios = require('axios');
const config = require('../config/env');

class DonorClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.services.donorUrl,
      timeout: 10000,
    });
  }

  async getAllDonations() {
    const res = await this.client.get('/api/donor/internal/all-donations');
    return res.data;
  }
}

module.exports = new DonorClient();
