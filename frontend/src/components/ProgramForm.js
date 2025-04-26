import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, TextField, Grid, 
  Typography, MenuItem, Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import dayjs from 'dayjs';

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

const validationSchema = Yup.object({
  name: Yup.string().required('Program name is required'),
  description: Yup.string().required('Description is required'),
  code: Yup.string().required('Program code is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date().nullable(),
  eligibility_criteria: Yup.string().nullable(),
  capacity: Yup.number().integer().nullable().min(0, 'Capacity must be a positive number'),
  location: Yup.string().required('Location is required'),
  category: Yup.number().required('Category is required')
});

const ProgramForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isEditMode = Boolean(id);

  const initialValues = {
    name: '',
    description: '',
    code: '',
    start_date: dayjs(),
    end_date: null,
    eligibility_criteria: '',
    capacity: '',
    location: '',
    category: ''
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first
        const categoriesResponse = await directApi.get('/program-categories/');
        // Ensure categories is always an array
        const categoriesData = categoriesResponse.data?.results || categoriesResponse.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        // If editing, fetch program details
        if (id) {
          const programResponse = await directApi.get(`/programs/${id}/`);
          const programData = programResponse.data;
          
          // Find the matching category object
          let categoryValue = '';
          if (programData.category_id) {
            categoryValue = programData.category_id;
          } else if (programData.category) {
            categoryValue = typeof programData.category === 'object' ? 
              programData.category.id : programData.category;
          }
          
          setProgram({
            ...programData,
            start_date: dayjs(programData.start_date),
            end_date: programData.end_date ? dayjs(programData.end_date) : null,
            category: categoryValue
          });
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchData();
  }, [id]);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      // Get the selected category ID
      const categoryId = parseInt(values.category, 10);
      
      // Create formatted values with the correct field structure
      const formattedValues = {
        name: values.name,
        description: values.description,
        code: values.code,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
        eligibility_criteria: values.eligibility_criteria || '',
        capacity: values.capacity === '' ? null : parseInt(values.capacity, 10),
        location: values.location,
        category_id: categoryId
      };
      
      // Log the data being sent
      console.log('Sending program data:', formattedValues);
      
      if (isEditMode) {
        await directApi.put(`/programs/${id}/`, formattedValues);
      } else {
        try {
          const response = await directApi.post('/programs/', formattedValues);
          console.log('Success response:', response.data);
        } catch (postError) {
          // Log more detailed error information
          console.error('Error response status:', postError.response?.status);
          console.error('Error response data:', postError.response?.data);
          console.error('Request data that caused error:', formattedValues);
          throw postError;
        }
      }
      
      navigate('/programs');
    } catch (err) {
      let errorMsg = 'Unknown error';
      
      if (err.response?.data) {
        // Format the error message in a more readable way
        if (typeof err.response.data === 'object') {
          errorMsg = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        } else {
          errorMsg = String(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setStatus({ error: `Failed to save program information: ${errorMsg}` });
      console.error('Full error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (categories.length === 0) return <Typography>No program categories found. Please create categories first.</Typography>;

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        {isEditMode ? 'Edit Program' : 'Create New Program'}
      </Typography>
      
      <Card>
        <CardContent>
          <Formik
            initialValues={program || initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, status }) => (
              <Form>
                {status && status.error && (
                  <Typography color="error" mb={2}>{status.error}</Typography>
                )}
                
                <Typography variant="h6">Program Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Program Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="code"
                      name="code"
                      label="Program Code"
                      value={values.code}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.code && Boolean(errors.code)}
                      helperText={touched.code && errors.code}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="description"
                      name="description"
                      label="Description"
                      multiline
                      rows={3}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Start Date *"
                      value={values.start_date}
                      onChange={(newValue) => setFieldValue('start_date', newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.start_date && Boolean(errors.start_date),
                          helperText: touched.start_date && errors.start_date
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="End Date (Optional)"
                      value={values.end_date}
                      onChange={(newValue) => setFieldValue('end_date', newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: touched.end_date && Boolean(errors.end_date),
                          helperText: touched.end_date && errors.end_date
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      id="category"
                      name="category"
                      label="Category"
                      value={values.category}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.category && Boolean(errors.category)}
                      helperText={touched.category && errors.category}
                      required
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="location"
                      name="location"
                      label="Location"
                      value={values.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.location && Boolean(errors.location)}
                      helperText={touched.location && errors.location}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="capacity"
                      name="capacity"
                      label="Capacity"
                      type="number"
                      value={values.capacity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.capacity && Boolean(errors.capacity)}
                      helperText={touched.capacity && errors.capacity}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="eligibility_criteria"
                      name="eligibility_criteria"
                      label="Eligibility Criteria"
                      multiline
                      rows={3}
                      value={values.eligibility_criteria}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.eligibility_criteria && Boolean(errors.eligibility_criteria)}
                      helperText={touched.eligibility_criteria && errors.eligibility_criteria}
                    />
                  </Grid>
                </Grid>
                
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    type="button" 
                    variant="outlined" 
                    onClick={() => navigate('/programs')}
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
                    {isEditMode ? 'Update Program' : 'Create Program'}
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

export default ProgramForm; 