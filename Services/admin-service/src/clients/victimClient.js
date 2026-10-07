const axios = require('axios');
const config = require('../config/env');

class VictimClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.services.victimUrl,
      timeout: 10000,
    });
  }

  async getAllReports() {
    const res = await this.client.get('/api/victim/internal/reports');
    return res.data;
  }

  async getHeatmap() {
    const res = await this.client.get('/api/victim/internal/heatmap');
    return res.data;
  }

  async softDeleteReport(reportId) {
    const res = await this.client.delete(`/api/victim/internal/reports/${reportId}`);
    return res.data;
  }
}

module.exports = new VictimClient();
