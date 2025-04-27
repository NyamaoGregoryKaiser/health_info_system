import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, Chip,
  Paper, IconButton, Tooltip, Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a direct API instance with the correct backend URL
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
    const authToken = localStorage.getItem('authToken');

    // If authenticated, add token to headers
    if (isAuthenticated === 'true') {
      if (authToken) {
        config.headers['Authorization'] = `Token ${authToken}`;
      }
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user && user.id) {
            // Add any additional auth headers if needed
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }

    // Ensure CSRF token is up to date
    const csrfToken = document.cookie.match(/csrftoken=([^;]*)/)?.[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const ProgramList = () => {
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Fetching programs...');
      
      // Load all programs (handle pagination)
      let allPrograms = [];
      let nextPageUrl = '/programs/';
      
      while (nextPageUrl) {
        const programsResponse = await directApi.get(nextPageUrl);
        console.log('Programs response:', programsResponse.data);
        
        // Add the current page results to our array
        const results = programsResponse.data?.results || [];
        allPrograms = [...allPrograms, ...results];
        
        // Check if there's another page
        nextPageUrl = programsResponse.data.next ? 
          programsResponse.data.next.replace('http://localhost:8000/api', '') : 
          null;
      }
      
      setPrograms(allPrograms);
      console.log('Total programs loaded:', allPrograms.length);
      
      // Get categories
      const categoriesResponse = await directApi.get('/program-categories/');
      console.log('Categories response:', categoriesResponse.data);
      
      const categoriesData = categoriesResponse.data?.results || categoriesResponse.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading programs:', err);
      
      // Show a more detailed error message
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        if (err.response.status === 401 || err.response.status === 403) {
          setError('Please log in to view programs');
        } else {
          setError(`Server error (${err.response.status}): ${err.response.data?.detail || 'Unknown error'}`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection.');
      } else {
        // Something else happened while setting up the request
        setError(`Error: ${err.message}`);
      }
      
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Show loading indicator and refresh data when component mounts
    const loadData = async () => {
      await fetchPrograms();
      
      // Check if there's a refresh param in the URL (coming from form)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('refresh') === 'true') {
        toast.success('Program list refreshed with the latest data!', {
          duration: 3000,
          icon: '🔄'
        });
        
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };
    
    loadData();
    
    // Add event listener to refresh data when page is focused (coming back from form)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPrograms();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Create programsByCategory object safely
  const programsByCategory = {};
  
  // Only try to reduce if programs is an array
  if (Array.isArray(programs) && programs.length > 0) {
    programs.forEach(program => {
      // Extract the category ID safely regardless of format
      let categoryId;
      
      if (program.category) {
        // If it's an object with an id property
        if (typeof program.category === 'object' && program.category.id) {
          categoryId = program.category.id;
        } 
        // If it's just the ID itself
        else if (typeof program.category === 'number' || typeof program.category === 'string') {
          categoryId = program.category;
        }
      } 
      // Fallback to category_id if available
      else if (program.category_id) {
        categoryId = program.category_id;
      }
        
      if (categoryId) {  // Only process if we found a valid category ID
        categoryId = Number(categoryId); // Ensure it's a number for consistency
        if (!programsByCategory[categoryId]) {
          programsByCategory[categoryId] = [];
        }
        programsByCategory[categoryId].push(program);
      } else {
        console.warn('Program with no category found:', program);
      }
    });
  }

  if (loading) return <Typography>Loading programs...</Typography>;
  
  if (error) {
    if (error.includes('Please log in')) {
      return (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error" gutterBottom>{error}</Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Log In
          </Button>
        </Box>
      );
    }
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Health Programs</Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={fetchPrograms}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/programs/new')}
          >
            Add Program
          </Button>
        </Box>
      </Box>

      {categories.length === 0 ? (
        <Typography>No program categories found. Please create categories first.</Typography>
      ) : (
        categories.map(category => (
          <Card key={category.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{category.name}</Typography>
              
              {programsByCategory[category.id]?.length > 0 ? (
                <Grid container spacing={2}>
                  {programsByCategory[category.id].map(program => (
                    <Grid item xs={12} sm={6} md={4} key={program.id}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column' 
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {program.name}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={program.is_active ? "Active" : "Inactive"} 
                            color={program.is_active ? "success" : "default"}
                          />
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary">
                          Code: {program.code}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mt: 1, mb: 1, flexGrow: 1 }}>
                          {program.description?.length > 100 
                            ? `${program.description.substring(0, 100)}...` 
                            : program.description}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">
                            Start: {program.start_date}
                            {program.end_date && ` ⟶ End: ${program.end_date}`}
                          </Typography>
                          
                          <Box>
                            <Tooltip title="Edit Program">
                              <IconButton 
                                size="small" 
                                onClick={() => navigate(`/programs/${program.id}/edit`)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Program Details">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/programs/${program.id}`)}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2">No programs in this category</Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default ProgramList;