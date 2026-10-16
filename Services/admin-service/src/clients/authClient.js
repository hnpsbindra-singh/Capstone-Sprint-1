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

  async getDonors() {
    const res = await this.client.get('/api/auth/internal/donors');
    return res.data;
  }

  async getNgos() {
    const res = await this.client.get('/api/auth/internal/ngos');
    return res.data;
  }

  async getAdmins() {
    const res = await this.client.get('/api/auth/internal/admins');
    return res.data;
  }

  async getAllUsers(role) {
    const res = await this.client.get('/api/auth/internal/users', {
      params: role ? { role } : {},
    });
    return res.data;
  }

  async setUserBlockStatus(userId, isBlocked) {
    const res = await this.client.put(`/api/auth/internal/user/${userId}/block`, {
      isBlocked,
    });
    return res.data;
  }

  async setVictimBlockStatus(victimId, isBlocked) {
    return this.setUserBlockStatus(victimId, isBlocked);
  }

  async createAdmin({ name, username, password }) {
    const res = await this.client.post('/api/auth/internal/admin/create-admin', {
      name,
      username,
      password,
    });
    return res.data;
  }

  async setNgoApprovalStatus(ngoId, isApproved) {
    const res = await this.client.put(`/api/auth/internal/ngo/${ngoId}/approve`, {
      isApproved,
    });
    return res.data;
  }
}

module.exports = new AuthClient();
