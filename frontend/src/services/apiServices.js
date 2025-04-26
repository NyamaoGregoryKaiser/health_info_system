import api from './api';
import axios from 'axios';

// Create an axios instance with the correct backend URL
const directApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': document.cookie.match(/csrftoken=([^;]*)/)?.[1] || ''
  },
  withCredentials: true
});

// Add an interceptor to handle authentication
directApi.interceptors.request.use(
  async (config) => {
    // Get user data from localStorage
    const userData = localStorage.getItem('userData');
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    // If authenticated, add token to headers
    if (isAuthenticated === 'true' && userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.id) {
          // Add any additional auth headers if needed
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }

    // Get CSRF token from cookies
    const csrfToken = document.cookie.match(/csrftoken=([^;]*)/)?.[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    // Log the request for debugging
    console.log('API Request:', config.method, config.url, config.headers);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication Services
export const authService = {
  login: async (username, password) => {
    try {
      // First get a CSRF token
      const csrfResponse = await fetch('http://localhost:8000/api/csrf-token/', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;
        
        // Use direct axios call with full URL and include the CSRF token
        const response = await axios.post('http://localhost:8000/api/test-login/', 
          { username, password },
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': csrfToken
            }
          }
        );
        
        // Store session cookie for future requests
        document.cookie = `sessionid=${document.cookie.match(/sessionid=([^;]*)/)?.[1] || ''}; path=/`;
        
        return response.data;
      } else {
        throw new Error('Failed to get CSRF token');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  getUserInfo: async () => {
    try {
      if (localStorage.getItem('isAuthenticated') === 'true') {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        return userData;
      }
      throw new Error('Not authenticated');
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  },
  
  getCSRFToken: async () => {
    try {
      const response = await directApi.get('/csrf-token/');
      return response.data.csrfToken;
    } catch (error) {
      console.error('Get CSRF token error:', error);
      throw error;
    }
  }
};

// Client Services
export const clientService = {
  getAllClients: async () => {
    try {
      const response = await directApi.get('/clients/');
      return response.data;
    } catch (error) {
      console.error('Get all clients error:', error);
      throw error;
    }
  },
  
  getClient: async (clientId) => {
    try {
      const response = await directApi.get(`/clients/${clientId}/`);
      return response.data;
    } catch (error) {
      console.error(`Get client ${clientId} error:`, error);
      throw error;
    }
  },
  
  createClient: async (clientData) => {
    try {
      const response = await directApi.post('/clients/', clientData);
      return response.data;
    } catch (error) {
      console.error('Create client error:', error);
      throw error;
    }
  },
  
  updateClient: async (clientId, clientData) => {
    try {
      const response = await directApi.put(`/clients/${clientId}/`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Update client ${clientId} error:`, error);
      throw error;
    }
  },
  
  deleteClient: async (clientId) => {
    try {
      const response = await directApi.delete(`/clients/${clientId}/`);
      return response.data;
    } catch (error) {
      console.error(`Delete client ${clientId} error:`, error);
      throw error;
    }
  },
  
  searchClients: async (searchTerm) => {
    try {
      const response = await directApi.get(`/clients/search/?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Search clients error:', error);
      throw error;
    }
  },
  
  getClientEnrollments: async (clientId) => {
    try {
      const response = await directApi.get(`/clients/${clientId}/enrollments/`);
      return response.data;
    } catch (error) {
      console.error(`Get client ${clientId} enrollments error:`, error);
      throw error;
    }
  },
  
  registerClient: async (registrationData) => {
    try {
      const response = await directApi.post('/clients/register/', registrationData);
      return response.data;
    } catch (error) {
      console.error('Register client error:', error);
      throw error;
    }
  }
};

// Health Program Services
export const programService = {
  getAllPrograms: async () => {
    try {
      const response = await directApi.get('/programs/');
      return response.data;
    } catch (error) {
      console.error('Get all programs error:', error);
      throw error;
    }
  },
  
  getProgram: async (programId) => {
    try {
      const response = await directApi.get(`/programs/${programId}/`);
      return response.data;
    } catch (error) {
      console.error(`Get program ${programId} error:`, error);
      throw error;
    }
  },
  
  createProgram: async (programData) => {
    try {
      const response = await directApi.post('/programs/', programData);
      return response.data;
    } catch (error) {
      console.error('Create program error:', error);
      throw error;
    }
  },
  
  updateProgram: async (programId, programData) => {
    try {
      const response = await directApi.put(`/programs/${programId}/`, programData);
      return response.data;
    } catch (error) {
      console.error(`Update program ${programId} error:`, error);
      throw error;
    }
  },
  
  deleteProgram: async (programId) => {
    try {
      const response = await directApi.delete(`/programs/${programId}/`);
      return response.data;
    } catch (error) {
      console.error(`Delete program ${programId} error:`, error);
      throw error;
    }
  },
  
  searchPrograms: async (searchTerm) => {
    try {
      const response = await directApi.get(`/programs/search/?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      console.error('Search programs error:', error);
      throw error;
    }
  }
};

// Program Category Services
export const categoryService = {
  getAllCategories: async () => {
    try {
      const response = await directApi.get('/program-categories/');
      return response.data;
    } catch (error) {
      console.error('Get all categories error:', error);
      throw error;
    }
  },
  
  getCategory: async (categoryId) => {
    try {
      const response = await directApi.get(`/program-categories/${categoryId}/`);
      return response.data;
    } catch (error) {
      console.error(`Get category ${categoryId} error:`, error);
      throw error;
    }
  },
  
  createCategory: async (categoryData) => {
    try {
      const response = await directApi.post('/program-categories/', categoryData);
      return response.data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },
  
  updateCategory: async (categoryId, categoryData) => {
    try {
      const response = await directApi.put(`/program-categories/${categoryId}/`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Update category ${categoryId} error:`, error);
      throw error;
    }
  },
  
  deleteCategory: async (categoryId) => {
    try {
      const response = await directApi.delete(`/program-categories/${categoryId}/`);
      return response.data;
    } catch (error) {
      console.error(`Delete category ${categoryId} error:`, error);
      throw error;
    }
  }
};

// Enrollment Services
export const enrollmentService = {
  getAllEnrollments: async () => {
    try {
      const response = await directApi.get('/enrollments/');
      return response.data;
    } catch (error) {
      console.error('Get all enrollments error:', error);
      throw error;
    }
  },
  
  getEnrollment: async (enrollmentId) => {
    try {
      const response = await directApi.get(`/enrollments/${enrollmentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Get enrollment ${enrollmentId} error:`, error);
      throw error;
    }
  },
  
  createEnrollment: async (enrollmentData) => {
    try {
      const response = await directApi.post('/enrollments/', enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Create enrollment error:', error);
      throw error;
    }
  },
  
  updateEnrollment: async (enrollmentId, enrollmentData) => {
    try {
      const response = await directApi.put(`/enrollments/${enrollmentId}/`, enrollmentData);
      return response.data;
    } catch (error) {
      console.error(`Update enrollment ${enrollmentId} error:`, error);
      throw error;
    }
  },
  
  deleteEnrollment: async (enrollmentId) => {
    try {
      const response = await directApi.delete(`/enrollments/${enrollmentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Delete enrollment ${enrollmentId} error:`, error);
      throw error;
    }
  },
  
  enrollClient: async (enrollmentData) => {
    try {
      const response = await directApi.post('/enrollments/enroll_client/', enrollmentData);
      return response.data;
    } catch (error) {
      console.error('Enroll client error:', error);
      throw error;
    }
  },
  
  toggleEnrollmentActive: async (enrollmentId) => {
    try {
      const response = await directApi.post(`/enrollments/${enrollmentId}/toggle_active/`);
      return response.data;
    } catch (error) {
      console.error(`Toggle enrollment ${enrollmentId} active error:`, error);
      throw error;
    }
  }
};

// Dashboard Services
export const dashboardService = {
  getDashboardSummary: async () => {
    try {
      const response = await directApi.get('/dashboard/');
      return response.data;
    } catch (error) {
      console.error('Get dashboard summary error:', error);
      throw error;
    }
  }
};

export default {
  auth: authService,
  clients: clientService,
  programs: programService,
  categories: categoryService,
  enrollments: enrollmentService,
  dashboard: dashboardService
}; 