import axios from 'axios';

// Support dynamic backend URL when deployed separately
const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api';

// Create a pre-configured Axios instance
const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Crucial for reading HTTP-Only session cookies
});

// Request interceptor to automatically inject authorization token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined' && token !== 'none') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to format errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    const message = error.response?.data?.error || error.response?.data?.data || 'Failed to reach backend services. Please check connection.';
    return Promise.reject(new Error(message));
  }
);

export default api;
