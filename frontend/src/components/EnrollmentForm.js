import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, TextField, Grid, 
  Typography, MenuItem, Divider, FormControlLabel, Checkbox,
  IconButton, Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import dayjs from 'dayjs';
import { toast } from 'react-hot-toast';
import RefreshIcon from '@mui/icons-material/Refresh';

const validationSchema = Yup.object({
  client: Yup.mixed().required('Client is required'),
  program: Yup.number().required('Program is required'),
  enrollment_date: Yup.date().required('Enrollment date is required'),
  is_active: Yup.boolean(),
  facility_name: Yup.string().nullable(),
  mfl_code: Yup.string().nullable(),
  notes: Yup.string().nullable()
});

// Create direct API instance with correct backend URL
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

const EnrollmentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [enrollment, setEnrollment] = useState(null);
  const [clients, setClients] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEditMode = Boolean(id);
  const formikRef = useRef(null);
  
  // Get clientId from location state if available (for pre-selection)
  const preselectedClientId = location.state?.clientId || '';
  console.log('Preselected client ID:', preselectedClientId);

  const initialValues = {
    client: preselectedClientId || '',
    program: '',
    enrollment_date: dayjs(),
    is_active: true,
    facility_name: '',
    mfl_code: '',
    notes: ''
  };

  // Define fetchData outside useEffect for reuse
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch clients and programs
      const clientsResponse = await directApi.get('/clients/');
      // Ensure clients is always an array
      const clientsData = clientsResponse.data?.results || clientsResponse.data || [];
      
      // Process clients to ensure we have the right ID field
      // The DB seems to expect a numeric client_id
      const processedClients = clientsData.map(client => {
        // Make sure client has an id property
        if (!client.id && client.client_id) {
          client.id = client.client_id;
        }
        
        // Create a numeric version of client ID
        let numericId = null;
        
        // Try to convert id to a number if possible
        if (client.id) {
          if (!isNaN(parseInt(client.id))) {
            numericId = parseInt(client.id);
          } else if (typeof client.id === 'string' && client.id.includes('-')) {
            // This is likely a UUID
            numericId = client.id; // Keep UUID for now
          }
        }
          
        return {
          ...client,
          // Add a numeric_id field to use for enrollment
          numeric_id: numericId,
          // Use the original id for display
          display_name: `${client.first_name} ${client.last_name} (${client.id_number || 'No ID'})`
        };
      });
      
      setClients(processedClients);
      
      // Log the client data
      console.log('Processed clients:', processedClients);
      if (processedClients.length > 0) {
        console.log('First client sample:', processedClients[0]);
        console.log('Client ID type:', typeof processedClients[0].id);
      }
      
      // Load all programs (handle pagination)
      let allPrograms = [];
      let nextPageUrl = '/programs/';
      
      console.log('Loading all programs...');
      while (nextPageUrl) {
        const programsResponse = await directApi.get(nextPageUrl);
        console.log('Programs response page:', programsResponse.data);
        
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
      
      // If editing, fetch enrollment details
      if (id) {
        const enrollmentResponse = await directApi.get(`/enrollments/${id}/`);
        const enrollmentData = enrollmentResponse.data;
        console.log('Editing existing enrollment:', enrollmentData);
        
        setEnrollment({
          ...enrollmentData,
          enrollment_date: dayjs(enrollmentData.enrollment_date)
        });
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
    
    // Add event listener to refresh data when page is focused (coming back from form)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing data...');
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      console.log('Submitting enrollment with values:', values);
      
      // Find the selected client object to get its ID
      const selectedClient = clients.find(c => c.id === values.client || c.numeric_id === values.client);
      console.log('Selected client:', selectedClient);
      
      if (!selectedClient) {
        throw new Error('Selected client not found');
      }
      
      // Check if program is selected
      if (!values.program) {
        throw new Error('Please select a program');
      }
      
      // Convert program_id to number if it's a string
      const program_id = typeof values.program === 'string' 
        ? parseInt(values.program, 10) 
        : values.program;
      
      // Verify program exists
      const selectedProgram = programs.find(p => p.id === program_id);
      if (!selectedProgram) {
        console.error(`Program with ID ${program_id} not found in available programs:`, programs);
        throw new Error(`Selected program not found. Please refresh the programs list and try again.`);
      }
      
      console.log('Selected program for enrollment:', selectedProgram);
      
      // Format data for the enrollment_client endpoint which expects client_id as UUID
      const enrollmentData = {
        client_id: selectedClient.client_id || selectedClient.id,
        program_id: program_id,
        enrollment_date: dayjs(values.enrollment_date).format('YYYY-MM-DD'),
        facility_name: values.facility_name || '',
        mfl_code: values.mfl_code || '',
        notes: values.notes || ''
      };
      
      console.log('Prepared enrollment data:', enrollmentData);

      if (id) {
        // For editing existing enrollment
        await directApi.put(`/enrollments/${id}/`, {
          program: values.program,
          enrollment_date: dayjs(values.enrollment_date).format('YYYY-MM-DD'),
          is_active: values.is_active,
          facility_name: values.facility_name || '',
          mfl_code: values.mfl_code || '',
          notes: values.notes || ''
        });
        toast.success('Enrollment updated successfully');
      } else {
        // For new enrollment, use the enroll_client endpoint
        try {
          const response = await directApi.post('/enrollments/enroll_client/', enrollmentData);
          console.log('Enrollment creation response:', response.data);
          resetForm();
          toast.success('Client enrolled successfully');
        } catch (postError) {
          console.error('Detailed POST error:', {
            status: postError.response?.status,
            statusText: postError.response?.statusText,
            data: postError.response?.data, 
            message: postError.message,
            stack: postError.stack
          });
          throw postError;
        }
      }
      
      if (location.state?.clientId) {
        navigate(`/clients/${location.state.clientId}`);
      } else {
        navigate('/clients');
      }
      
    } catch (err) {
      console.error('Error submitting enrollment:', err);
      const errorMessage = err.response?.data?.detail || 
                          Object.values(err.response?.data || {}).flat().join(', ') ||
                          err.message ||
                          'Failed to save enrollment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Process programs to group by category
  const organizePrograms = useCallback(() => {
    const programsByCategory = {};
    const categoryNames = {};
    
    // First pass: organize programs by category and collect category names
    programs.forEach(program => {
      if (program.category) {
        const categoryId = typeof program.category === 'object' ? program.category.id : program.category;
        const categoryName = typeof program.category === 'object' ? program.category.name : 'Other';
        
        if (!programsByCategory[categoryId]) {
          programsByCategory[categoryId] = [];
          categoryNames[categoryId] = categoryName;
        }
        
        programsByCategory[categoryId].push(program);
      } else {
        // For programs without a category
        if (!programsByCategory['uncategorized']) {
          programsByCategory['uncategorized'] = [];
          categoryNames['uncategorized'] = 'Uncategorized';
        }
        programsByCategory['uncategorized'].push(program);
      }
    });
    
    return { programsByCategory, categoryNames };
  }, [programs]);

  const { programsByCategory, categoryNames } = organizePrograms();

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (clients.length === 0) return <Typography>No clients found. Please register clients first.</Typography>;
  if (programs.length === 0) return <Typography>No programs found. Please create programs first.</Typography>;

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        {isEditMode ? 'Edit Enrollment' : 'New Program Enrollment'}
      </Typography>
      
      <Card>
        <CardContent>
          <Formik
            initialValues={enrollment || initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
            innerRef={formikRef}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, status }) => (
              <Form>
                {status && status.error && (
                  <Typography color="error" mb={2}>{status.error}</Typography>
                )}
                
                <Typography variant="h6">Enrollment Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      id="client"
                      name="client"
                      label="Client"
                      value={values.client || ''}
                      onChange={(e) => {
                        const selectedValue = e.target.value;
                        console.log('Client selected value:', selectedValue);
                        // Directly set the field value
                        setFieldValue('client', selectedValue);
                      }}
                      onBlur={handleBlur}
                      error={touched.client && Boolean(errors.client)}
                      helperText={touched.client && errors.client}
                      disabled={Boolean(preselectedClientId)}
                      required
                    >
                      <MenuItem value="">
                        <em>Select a client</em>
                      </MenuItem>
                      {clients.map((client) => {
                        // Use numeric_id if available, otherwise fall back to id
                        const clientValue = client.numeric_id || client.id;
                        console.log('Rendering client option:', client.id, 'value:', clientValue, 'name:', client.display_name || `${client.first_name} ${client.last_name}`);
                        return (
                          <MenuItem key={client.id} value={clientValue}>
                            {client.display_name || `${client.first_name} ${client.last_name}`}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      id="program"
                      name="program"
                      label="Program"
                      value={values.program || ''}
                      onChange={(e) => {
                        console.log('Program selected:', e.target.value);
                        // Try to parse as number first
                        const selectedValue = Number(e.target.value);
                        if (!isNaN(selectedValue)) {
                          console.log(`Setting program value to: ${selectedValue}`);
                          setFieldValue('program', selectedValue);
                          
                          // Find the program and log details
                          const program = programs.find(p => p.id === selectedValue);
                          if (program) {
                            console.log('Selected program:', program);
                            // Show success message for user feedback
                            toast.success(`Selected program: ${program.name}`);
                          }
                        } else {
                          // If it's not a number, set as string
                          setFieldValue('program', e.target.value);
                        }
                      }}
                      onBlur={handleBlur}
                      error={touched.program && Boolean(errors.program)}
                      helperText={touched.program && errors.program ? errors.program : 
                        values.program ? `Program selected: ${programs.find(p => p.id === Number(values.program))?.name || ''}` : ''}
                      required
                      InputProps={{
                        endAdornment: (
                          <Tooltip title="Refresh programs list">
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Prevent dropdown closing
                                toast.promise(
                                  fetchData(),
                                  {
                                    loading: 'Refreshing programs...',
                                    success: `${programs.length} programs loaded!`,
                                    error: 'Failed to refresh programs'
                                  }
                                );
                              }}
                            >
                              <RefreshIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )
                      }}
                      SelectProps={{
                        MenuProps: {
                          PaperProps: {
                            style: {
                              maxHeight: 400, // Make the dropdown taller
                            },
                          },
                        },
                      }}
                      sx={{
                        '& .MuiInputBase-input': {
                          fontWeight: values.program ? 'bold' : 'normal',
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>Select a program</em>
                      </MenuItem>
                      
                      {/* Simple list of all programs */}
                      {programs.length === 0 ? (
                        <MenuItem disabled>No programs available</MenuItem>
                      ) : (
                        programs.map(program => {
                          const isSelected = values.program === program.id;
                          return (
                            <MenuItem 
                              key={program.id} 
                              value={program.id}
                              sx={{
                                fontWeight: isSelected ? 'bold' : 'normal',
                                backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.08)' : 'transparent'
                              }}
                            >
                              {program.name} ({program.code})
                            </MenuItem>
                          );
                        })
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Enrollment Date *"
                      value={values.enrollment_date}
                      onChange={(newValue) => setFieldValue('enrollment_date', newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.enrollment_date && Boolean(errors.enrollment_date),
                          helperText: touched.enrollment_date && errors.enrollment_date
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="is_active"
                          checked={values.is_active}
                          onChange={handleChange}
                        />
                      }
                      label="Active Enrollment"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="facility_name"
                      name="facility_name"
                      label="Facility Name"
                      value={values.facility_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.facility_name && Boolean(errors.facility_name)}
                      helperText={touched.facility_name && errors.facility_name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="mfl_code"
                      name="mfl_code"
                      label="MFL Code"
                      value={values.mfl_code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.mfl_code && Boolean(errors.mfl_code)}
                      helperText={touched.mfl_code && errors.mfl_code}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="notes"
                      name="notes"
                      label="Notes"
                      multiline
                      rows={3}
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.notes && Boolean(errors.notes)}
                      helperText={touched.notes && errors.notes}
                    />
                  </Grid>
                </Grid>
                
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    type="button" 
                    variant="outlined" 
                    onClick={() => location.state?.clientId ? 
                      navigate(`/clients/${location.state.clientId}`) : 
                      navigate('/clients')}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    disabled={isSubmitting}
                  >
                    {isEditMode ? 'Update Enrollment' : 'Complete Enrollment'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EnrollmentForm; 