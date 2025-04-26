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

// Function to request a CSRF token before making authenticated requests
export const fetchCSRFToken = async () => {
  try {
    const response = await api.get('/csrf-token/');
    return response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Intercept requests to handle auth tokens if needed
api.interceptors.request.use(
  async (config) => {
    // Log the request for debugging
    console.log('API Request:', config.method, config.url);
    
    // Make sure the URL includes /api prefix
    if (!config.url?.startsWith('/')) {
      config.url = `/${config.url}`;
    }
    
    // Add CSRF token to non-GET requests
    if (config.method !== 'get') {
      // First try to get from cookie
      let csrfToken = getCSRFToken();
      
      // If not available in cookie, fetch from endpoint
      if (!csrfToken && config.url !== '/csrf-token/') {
        console.log('No CSRF token found in cookies, fetching from endpoint...');
        try {
          csrfToken = await fetchCSRFToken();
        } catch (error) {
          console.error('Error fetching CSRF token:', error);
        }
      }
      
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      } else {
        console.warn('No CSRF token available for request:', config.url);
      }
    }
    
    // Add auth token if available (for token auth)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Token ${token}`;
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
      // Only redirect if not already on auth-related pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // Redirect to login
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;