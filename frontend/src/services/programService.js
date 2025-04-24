import api from './api';

const programService = {
  // Get all health programs with optional filtering
  getPrograms: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get('/programs/', { params });
    return response.data;
  },
  
  // Get a single program by ID
  getProgram: async (id) => {
    const response = await api.get(`/programs/${id}/`);
    return response.data;
  },
  
  // Create a new program
  createProgram: async (programData) => {
    const response = await api.post('/programs/', programData);
    return response.data;
  },
  
  // Update an existing program
  updateProgram: async (id, programData) => {
    const response = await api.put(`/programs/${id}/`, programData);
    return response.data;
  },
  
  // Delete a program
  deleteProgram: async (id) => {
    await api.delete(`/programs/${id}/`);
    return true;
  },
  
  // Get program categories
  getCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },
  
  // Create a new enrollment
  createEnrollment: async (enrollmentData) => {
    const response = await api.post('/enrollments/', enrollmentData);
    return response.data;
  },
  
  // Update an enrollment
  updateEnrollment: async (id, enrollmentData) => {
    const response = await api.put(`/enrollments/${id}/`, enrollmentData);
    return response.data;
  },
  
  // Get program enrollments
  getProgramEnrollments: async (programId) => {
    const response = await api.get('/enrollments/', {
      params: { program: programId }
    });
    return response.data;
  },
  
  // Search programs
  searchPrograms: async (query) => {
    const response = await api.get('/programs/search/', { 
      params: { q: query } 
    });
    return response.data.results;
  },
  
  // Get dashboard data
  getDashboardData: async () => {
    const response = await api.get('/dashboard/summary/');
    return response.data;
  }
};

export default programService; 