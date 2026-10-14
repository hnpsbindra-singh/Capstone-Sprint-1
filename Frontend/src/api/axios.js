import axios from 'axios';

// Dynamically determine Gateway host based on how the frontend is accessed
// If opened on localhost -> http://localhost:8080
// If opened via Wi-Fi IP (e.g. from a mobile phone) -> http://<WiFi-IP>:8080
const getBaseUrl = () => {
  return import.meta.env.VITE_API_GATEWAY_URL || 'https://apigateway-latest-kz57.onrender.com';
};

const API = axios.create({
  baseURL: getBaseUrl(),
});

// Request interceptor to attach bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized and 429 Rate Limiting
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      } else if (error.response.status === 429) {
        const defaultMsg =
          'Rate limit reached: Maximum 5 flood reports allowed per hour. Please wait before submitting again.';
        const customMsg = error.response.data?.message || error.response.data?.error || defaultMsg;
        if (!error.response.data || typeof error.response.data !== 'object') {
          error.response.data = { message: customMsg };
        } else if (!error.response.data.message) {
          error.response.data.message = customMsg;
        }
        error.message = customMsg;
      }
    }
    return Promise.reject(error);
  }
);

export default API;
