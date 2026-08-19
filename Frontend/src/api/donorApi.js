import API from './axios';

export const getHeatmap = async () => {
  const response = await API.get('/api/donor/heatmap');
  return response.data;
};

export const getRequests = async () => {
  const response = await API.get('/api/donor/requests');
  return response.data;
};

export const donate = async (ngoRequestId, donationData) => {
  const response = await API.post(`/api/donor/donate/${ngoRequestId}`, donationData);
  return response.data;
};

export const getMyDonations = async () => {
  const response = await API.get('/api/donor/my-donations');
  return response.data;
};
