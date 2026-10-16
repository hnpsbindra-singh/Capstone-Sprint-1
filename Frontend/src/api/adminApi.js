import API from './axios';

export const getReports = async () => {
  const response = await API.get('/api/admin/reports');
  return response.data;
};

export const getHeatmap = async () => {
  const response = await API.get('/api/admin/heatmap');
  return response.data;
};

export const getNgoRequests = async () => {
  const response = await API.get('/api/admin/ngo-requests');
  return response.data;
};

export const getDonations = async () => {
  const response = await API.get('/api/admin/donations');
  return response.data;
};

export const getVictims = async () => {
  const response = await API.get('/api/admin/victims');
  return response.data;
};

export const getDonors = async () => {
  const response = await API.get('/api/admin/donors');
  return response.data;
};

export const getNgos = async () => {
  const response = await API.get('/api/admin/ngos');
  return response.data;
};

export const getAdmins = async () => {
  const response = await API.get('/api/admin/admins');
  return response.data;
};

export const getAllUsers = async (role) => {
  const response = await API.get('/api/admin/users', {
    params: role && role !== 'ALL' ? { role } : {},
  });
  return response.data;
};

export const setUserBlockStatus = async (userId, isBlocked) => {
  const response = await API.put(`/api/admin/users/${userId}/block`, { isBlocked });
  return response.data;
};

export const setVictimBlockStatus = async (victimId, isBlocked) => {
  return setUserBlockStatus(victimId, isBlocked);
};

export const softDeleteReport = async (reportId) => {
  const response = await API.delete(`/api/admin/reports/${reportId}`);
  return response.data;
};

export const createAdmin = async ({ name, username, password }) => {
  const response = await API.post('/api/admin/admins', { name, username, password });
  return response.data;
};

export const setNgoApprovalStatus = async (ngoId, isApproved) => {
  const response = await API.put(`/api/admin/ngos/${ngoId}/approve`, { isApproved });
  return response.data;
};

