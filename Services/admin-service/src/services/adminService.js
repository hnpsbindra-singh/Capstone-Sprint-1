const victimClient = require('../clients/victimClient');
const ngoClient = require('../clients/ngoClient');
const donorClient = require('../clients/donorClient');
const authClient = require('../clients/authClient');

class AdminService {
  async getReports() {
    return victimClient.getAllReports();
  }

  async getHeatmap() {
    return victimClient.getHeatmap();
  }

  async getNgoRequests() {
    return ngoClient.getAllRequests();
  }

  async getDonations() {
    return donorClient.getAllDonations();
  }

  async getVictims() {
    return authClient.getVictims();
  }

  async blockVictim(victimId, isBlocked) {
    return authClient.setVictimBlockStatus(victimId, isBlocked);
  }

  async softDeleteReport(reportId) {
    return victimClient.softDeleteReport(reportId);
  }
}

module.exports = new AdminService();
