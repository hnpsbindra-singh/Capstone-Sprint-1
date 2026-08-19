import API from './axios';

export const getHeatmap = async () => {
  const response = await API.get('/api/ngo/heatmap');
  return response.data;
};

export const createRequest = async (ngoId, requestData) => {
  const response = await API.post(`/api/ngo/request?ngoId=${ngoId}`, requestData);
  return response.data;
};

export const getAvailableDonations = async () => {
  const response = await API.get('/api/ngo/available-donations');
  return response.data;
};

export const getMyRequests = async () => {
  const response = await API.get('/api/ngo/my-requests');
  return response.data;
};

export const acceptDonation = async (donationId) => {
  const response = await API.post(`/api/ngo/accept/${donationId}`);
  return response.data;
};

export const deliverDonation = async (donationId) => {
  const response = await API.post(`/api/ngo/delivered/${donationId}`);
  return response.data;
};
