import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, Grid, IconButton,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
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

const EnrollmentList = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching enrollment data...');
        
        // Fetch enrollments and clients in parallel
        const [enrollmentsResponse, clientsResponse] = await Promise.all([
          directApi.get('/enrollments/'),
          directApi.get('/clients/')
        ]);
        
        // Process enrollments data
        const enrollmentsData = enrollmentsResponse.data?.results || enrollmentsResponse.data || [];
        console.log('Raw enrollments data:', enrollmentsData);
        const processedEnrollments = Array.isArray(enrollmentsData) ? enrollmentsData : [];
        
        // Process clients data
        const clientsData = clientsResponse.data?.results || clientsResponse.data || [];
        console.log('Raw clients data:', clientsData);
        
        // Create a map of client IDs to client data for quick lookup
        const clientsMap = {};
        if (Array.isArray(clientsData)) {
          clientsData.forEach(client => {
            // Store client by both client_id and any numeric id if available
            if (client.client_id) {
              clientsMap[client.client_id] = client;
            }
            if (client.id) {
              clientsMap[client.id] = client;
            }
          });
        }
        
        setClients(clientsMap);
        console.log('Clients map:', clientsMap);
        
        // Enhance enrollment data with client information if available
        const enhancedEnrollments = processedEnrollments.map(enrollment => {
          // Find the client by looking at all possible client ID fields
          let clientData = null;
          
          // Check for the field that contains the client reference (could be client_id or client)
          const clientRef = enrollment.client_id || enrollment.client;
          
          if (clientRef) {
            console.log('Looking for client with ID:', clientRef);
            clientData = clientsMap[clientRef];
          }
          
          // If client data was found, enhance the enrollment
          if (clientData) {
            console.log('Found client:', clientData.first_name, clientData.last_name);
            return {
              ...enrollment,
              client_data: clientData,
              client_name: `${clientData.first_name} ${clientData.last_name}`,
              client_id_number: clientData.id_number
            };
          } else {
            console.log('Client not found for enrollment:', enrollment.id);
          }
          
          return enrollment;
        });
        
        console.log('Enhanced enrollments:', enhancedEnrollments);
        setEnrollments(enhancedEnrollments);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
        console.error('Error loading data:', err);
      }
    };
    
    fetchData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleToggleActive = async (enrollmentId, currentStatus) => {
    try {
      await directApi.post(`/enrollments/${enrollmentId}/toggle_active/`);
      
      // Update the local state by changing the is_active status for this enrollment
      setEnrollments(prevEnrollments => 
        prevEnrollments.map(enrollment => 
          enrollment.id === enrollmentId 
            ? { ...enrollment, is_active: !currentStatus } 
            : enrollment
        )
      );
      
      toast.success(`Enrollment ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      console.error('Error toggling enrollment status:', err);
      toast.error('Failed to update enrollment status');
    }
  };

  const handleDelete = async (enrollmentId) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      try {
        await directApi.delete(`/enrollments/${enrollmentId}/`);
        
        // Remove the deleted enrollment from the local state
        setEnrollments(prevEnrollments => 
          prevEnrollments.filter(enrollment => enrollment.id !== enrollmentId)
        );
        
        toast.success('Enrollment deleted successfully');
      } catch (err) {
        console.error('Error deleting enrollment:', err);
        toast.error('Failed to delete enrollment');
      }
    }
  };

  // Apply pagination
  const displayedEnrollments = enrollments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  );
  
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Program Enrollments</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/enrollments/new')}
        >
          New Enrollment
        </Button>
      </Box>

      <Card>
        <CardContent>
          {enrollments.length === 0 ? (
            <Typography>No enrollments found. Click the button above to create one.</Typography>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>ID Number</TableCell>
                      <TableCell>Program</TableCell>
                      <TableCell>Enrollment Date</TableCell>
                      <TableCell>Facility</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedEnrollments.map(enrollment => {
                      // Find client ID for linking to profile
                      const clientId = enrollment.client_data?.client_id || enrollment.client;
                      
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell>
                            {enrollment.client_name ? (
                              <Link 
                                to={`/clients/${clientId}`}
                                style={{ textDecoration: 'none', color: '#0e7c61' }}
                              >
                                {enrollment.client_name}
                              </Link>
                            ) : (
                              'Unknown Client'
                            )}
                          </TableCell>
                          <TableCell>
                            {enrollment.client_id_number || '-'}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {enrollment.program_name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {enrollment.program_code}
                            </Typography>
                          </TableCell>
                          <TableCell>{enrollment.enrollment_date}</TableCell>
                          <TableCell>{enrollment.facility_name || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={enrollment.is_active ? "Active" : "Inactive"}
                              color={enrollment.is_active ? "success" : "default"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              color={enrollment.is_active ? "default" : "success"}
                              onClick={() => handleToggleActive(enrollment.id, enrollment.is_active)}
                              title={enrollment.is_active ? "Deactivate" : "Activate"}
                            >
                              {enrollment.is_active ? <InactiveIcon /> : <ActiveIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => navigate(`/enrollments/${enrollment.id}/edit`)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(enrollment.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={enrollments.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnrollmentList; 