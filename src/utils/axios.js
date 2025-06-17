
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let csrfToken = null;

// Function to get CSRF token
const getCSRFToken = async () => {
  if (!csrfToken) {
    try {
      await api.get('/api/auth/csrf-token/');
      // The token is now set in cookies, we'll extract it from there
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
      if (csrfCookie) {
        csrfToken = csrfCookie.split('=')[1];
      }
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  return csrfToken;
};

// Request interceptor to add CSRF token to non-GET requests
api.interceptors.request.use(async (config) => {
  if (config.method !== 'get') {
    const token = await getCSRFToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // CSRF token might be invalid, reset it
      csrfToken = null;
    }
    return Promise.reject(error);
  }
);

export default api;
