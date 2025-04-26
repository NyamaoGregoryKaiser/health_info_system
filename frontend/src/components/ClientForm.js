import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, TextField, Grid, 
  Typography, MenuItem, FormControl, Divider
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
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  id_number: Yup.string().nullable(),
  date_of_birth: Yup.date().required('Date of birth is required'),
  gender: Yup.string().oneOf(['M', 'F', 'O']).required('Gender is required'),
  phone_number: Yup.string().nullable(),
  email: Yup.string().email('Invalid email format').nullable(),
  county: Yup.string().required('County is required'),
  sub_county: Yup.string().required('Sub-county is required'),
  ward: Yup.string().nullable(),
  blood_type: Yup.string().nullable(),
  allergies: Yup.string().nullable()
});

const ClientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const isEditMode = Boolean(id);

  const initialValues = {
    first_name: '',
    last_name: '',
    id_number: '',
    date_of_birth: dayjs(),
    gender: 'M',
    phone_number: '',
    email: '',
    county: '',
    sub_county: '',
    ward: '',
    blood_type: '',
    allergies: ''
  };

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        try {
          const response = await directApi.get(`/clients/${id}/`);
          const clientData = response.data;
          
          setClient({
            ...clientData,
            date_of_birth: dayjs(clientData.date_of_birth)
          });
          
          setLoading(false);
        } catch (err) {
          setError('Failed to load client data');
          setLoading(false);
          console.error(err);
        }
      };
      
      fetchClient();
    }
  }, [id]);

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const formattedValues = {
        ...values,
        date_of_birth: values.date_of_birth.format('YYYY-MM-DD')
      };
      
      if (isEditMode) {
        await directApi.put(`/clients/${id}/`, formattedValues);
      } else {
        await directApi.post('/clients/', formattedValues);
      }
      
      navigate('/clients');
    } catch (err) {
      setStatus({ error: 'Failed to save client information' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Typography>Loading client information...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        {isEditMode ? 'Edit Client' : 'Register New Client'}
      </Typography>
      
      <Card>
        <CardContent>
          <Formik
            initialValues={client || initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue, status }) => (
              <Form>
                {status && status.error && (
                  <Typography color="error" mb={2}>{status.error}</Typography>
                )}
                
                <Typography variant="h6">Personal Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="first_name"
                      name="first_name"
                      label="First Name"
                      value={values.first_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.first_name && Boolean(errors.first_name)}
                      helperText={touched.first_name && errors.first_name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="last_name"
                      name="last_name"
                      label="Last Name"
                      value={values.last_name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.last_name && Boolean(errors.last_name)}
                      helperText={touched.last_name && errors.last_name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="id_number"
                      name="id_number"
                      label="ID Number"
                      value={values.id_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.id_number && Boolean(errors.id_number)}
                      helperText={touched.id_number && errors.id_number}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <DatePicker
                        label="Date of Birth"
                        value={values.date_of_birth}
                        onChange={(newValue) => setFieldValue('date_of_birth', newValue)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: touched.date_of_birth && Boolean(errors.date_of_birth),
                            helperText: touched.date_of_birth && errors.date_of_birth
                          }
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      id="gender"
                      name="gender"
                      label="Gender"
                      value={values.gender}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.gender && Boolean(errors.gender)}
                      helperText={touched.gender && errors.gender}
                      required
                    >
                      <MenuItem value="M">Male</MenuItem>
                      <MenuItem value="F">Female</MenuItem>
                      <MenuItem value="O">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone_number"
                      name="phone_number"
                      label="Phone Number"
                      value={values.phone_number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.phone_number && Boolean(errors.phone_number)}
                      helperText={touched.phone_number && errors.phone_number}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6">Location Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="county"
                      name="county"
                      label="County"
                      value={values.county}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.county && Boolean(errors.county)}
                      helperText={touched.county && errors.county}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="sub_county"
                      name="sub_county"
                      label="Sub-county"
                      value={values.sub_county}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.sub_county && Boolean(errors.sub_county)}
                      helperText={touched.sub_county && errors.sub_county}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="ward"
                      name="ward"
                      label="Ward"
                      value={values.ward}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.ward && Boolean(errors.ward)}
                      helperText={touched.ward && errors.ward}
                    />
                  </Grid>
                </Grid>
                
                <Typography variant="h6">Health Information</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="blood_type"
                      name="blood_type"
                      label="Blood Type"
                      value={values.blood_type}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.blood_type && Boolean(errors.blood_type)}
                      helperText={touched.blood_type && errors.blood_type}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="allergies"
                      name="allergies"
                      label="Allergies"
                      multiline
                      rows={3}
                      value={values.allergies}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.allergies && Boolean(errors.allergies)}
                      helperText={touched.allergies && errors.allergies}
                    />
                  </Grid>
                </Grid>
                
                <Box display="flex" justifyContent="flex-end">
                  <Button 
                    type="button" 
                    variant="outlined" 
                    onClick={() => navigate('/clients')}
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
                    {isEditMode ? 'Update Client' : 'Register Client'}
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

export default ClientForm; 