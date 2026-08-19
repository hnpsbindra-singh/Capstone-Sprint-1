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

export const setVictimBlockStatus = async (victimId, isBlocked) => {
  const response = await API.put(`/api/admin/victims/${victimId}/block`, { isBlocked });
  return response.data;
};

export const softDeleteReport = async (reportId) => {
  const response = await API.delete(`/api/admin/reports/${reportId}`);
  return response.data;
};

