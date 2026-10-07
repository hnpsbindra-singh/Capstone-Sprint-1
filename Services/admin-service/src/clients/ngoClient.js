const axios = require('axios');
const config = require('../config/env');

class NgoClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.services.ngoUrl,
      timeout: 10000,
    });
  }

  async getAllRequests() {
    const res = await this.client.get('/api/ngo/internal/requests');
    return res.data;
  }
}

module.exports = new NgoClient();
