import axios from 'axios';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with cross-domain requests
});

// Intercept requests to handle auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if using token-based auth
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      // Optionally dispatch a logout action or redirect
      console.log('Unauthorized access - please log in again');
    }
    return Promise.reject(error);
  }
);

export default api;