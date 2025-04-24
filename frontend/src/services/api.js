import axios from 'axios';

// Create axios instance with common configuration
const api = axios.create({
  baseURL: '/api',  // This will be appended to the proxy URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with cross-domain requests
});

// Function to get CSRF token from cookie
const getCSRFToken = () => {
  const name = 'csrftoken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

// Apply this configuration to the global axios instance as well
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Intercept requests to handle auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log('API Request:', config.method, config.url);
    
    // Make sure the URL includes /api prefix
    if (!config.url?.startsWith('/')) {
      config.url = `/${config.url}`;
    }
    
    // Add CSRF token to non-GET requests
    if (config.method !== 'get') {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    // Add authentication token if available
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

// Intercept responses to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    
    // Handle 401 Unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      // Reload the page to go to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;