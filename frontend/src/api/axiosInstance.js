import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization Bearer token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('splitease_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (err) {
        console.error('Error parsing user token:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 unauthenticated status
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired token if necessary
      if (localStorage.getItem('splitease_user')) {
        localStorage.removeItem('splitease_user');
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
