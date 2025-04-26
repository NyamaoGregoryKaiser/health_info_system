import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, Typography, Grid, 
  Chip, Divider, Paper, List
} from '@mui/material';
import axios from 'axios';

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

    // Ensure CSRF token is up to date
    const csrfToken = document.cookie.match(/csrftoken=([^;]*)/)?.[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const ClientProfile = () => {
  const [client, setClient] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await directApi.get(`/clients/${id}/`);
        setClient(response.data);
        
        // Get enrollments from the client data if available
        const enrollmentsData = response.data.enrollments || [];
        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load client data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchClient();
  }, [id]);

  if (loading) return <Typography>Loading client information...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!client) return <Typography>Client not found</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Client Profile</Typography>
        <Box>
          <Button 
            variant="outlined" 
            sx={{ mr: 1 }}
            onClick={() => navigate(`/clients/${id}/edit`)}
          >
            Edit Client
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/enrollments/new', { state: { clientId: id } })}
          >
            Enroll in Program
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Personal Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                  <Typography variant="body1">{client.first_name} {client.last_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">ID Number</Typography>
                  <Typography variant="body1">{client.id_number || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Date of Birth</Typography>
                  <Typography variant="body1">{client.date_of_birth}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Gender</Typography>
                  <Typography variant="body1">
                    {client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : 'Other'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Phone</Typography>
                  <Typography variant="body1">{client.phone_number || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{client.email || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Location Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">County</Typography>
                  <Typography variant="body1">{client.county}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Sub-County</Typography>
                  <Typography variant="body1">{client.sub_county}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Ward</Typography>
                  <Typography variant="body1">{client.ward || 'Not specified'}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Health Information</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">Blood Type</Typography>
                  <Typography variant="body1">{client.blood_type || 'Not recorded'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">Allergies</Typography>
                  <Typography variant="body1">{client.allergies || 'None recorded'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Program Enrollments</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {enrollments.length === 0 ? (
                <Typography>No program enrollments found for this client.</Typography>
              ) : (
                <List>
                  {enrollments.map((enrollment) => (
                    <Paper key={enrollment.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle1">{enrollment.program_name}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            Enrolled: {enrollment.enrollment_date}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} textAlign="right">
                          <Chip 
                            label={enrollment.is_active ? "Active" : "Inactive"} 
                            color={enrollment.is_active ? "success" : "error"}
                            size="small"
                          />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Facility: {enrollment.facility_name || 'Not specified'}
                          </Typography>
                        </Grid>
                        {enrollment.notes && (
                          <Grid item xs={12}>
                            <Typography variant="body2">{enrollment.notes}</Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientProfile; 