const axios = require('axios');
const config = require('../config/env');

class DonorClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.services.donorUrl,
      timeout: 10000,
    });
  }

  async getDonationsForRequests(ngoRequestIds) {
    const res = await this.client.get('/api/donor/internal/donations', {
      params: { ngoRequestIds: ngoRequestIds.join(',') },
    });
    return res.data;
  }

  async getDonationById(id) {
    const res = await this.client.get(`/api/donor/internal/donations/${id}`);
    return res.data;
  }

  async updateDonationStatus(id, payload) {
    const res = await this.client.put(`/api/donor/internal/donations/${id}/status`, payload);
    return res.data;
  }
}

module.exports = new DonorClient();
