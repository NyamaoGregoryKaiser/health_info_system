import api from './api';

const clientService = {
  // Get all clients with optional filtering
  getClients: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get('/clients/', { params });
    return response.data;
  },
  
  // Get a single client by ID
  getClient: async (id) => {
    const response = await api.get(`/clients/${id}/`);
    return response.data;
  },
  
  // Create a new client
  createClient: async (clientData) => {
    const response = await api.post('/clients/', clientData);
    return response.data;
  },
  
  // Update an existing client
  updateClient: async (id, clientData) => {
    const response = await api.put(`/clients/${id}/`, clientData);
    return response.data;
  },
  
  // Delete a client
  deleteClient: async (id) => {
    await api.delete(`/clients/${id}/`);
    return true;
  },
  
  // Search clients
  searchClients: async (query) => {
    const response = await api.get('/clients/search/', { 
      params: { q: query } 
    });
    return response.data.results;
  },
  
  // Get client enrollments
  getClientEnrollments: async (clientId) => {
    const response = await api.get('/enrollments/', {
      params: { client: clientId }
    });
    return response.data;
  }
};

export default clientService; 