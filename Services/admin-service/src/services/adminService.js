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

  async getDonors() {
    return authClient.getDonors();
  }

  async getNgos() {
    return authClient.getNgos();
  }

  async getAdmins() {
    return authClient.getAdmins();
  }

  async getAllUsers(role) {
    return authClient.getAllUsers(role);
  }

  async blockUser(userId, isBlocked) {
    return authClient.setUserBlockStatus(userId, isBlocked);
  }

  async blockVictim(victimId, isBlocked) {
    return authClient.setUserBlockStatus(victimId, isBlocked);
  }

  async softDeleteReport(reportId) {
    return victimClient.softDeleteReport(reportId);
  }

  async createAdmin(adminData) {
    return authClient.createAdmin(adminData);
  }

  async setNgoApprovalStatus(ngoId, isApproved) {
    return authClient.setNgoApprovalStatus(ngoId, isApproved);
  }
}

module.exports = new AdminService();
