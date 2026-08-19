import axios from 'axios';

// Dynamically determine Gateway host based on how the frontend is accessed
// If opened on localhost -> http://localhost:8080
// If opened via Wi-Fi IP (e.g. from a mobile phone) -> http://<WiFi-IP>:8080
const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
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

// Response interceptor to handle 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
