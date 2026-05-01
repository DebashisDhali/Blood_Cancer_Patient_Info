import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Automatically add token to headers if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired token) — prevents broken authenticated state
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if user is on a protected page
      if (window.location.pathname === '/admin') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
