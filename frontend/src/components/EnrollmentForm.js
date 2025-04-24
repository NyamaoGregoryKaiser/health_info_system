import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Box, Button, Card, CardContent, TextField, Grid, 
  Typography, MenuItem, Divider, FormControlLabel, Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import dayjs from 'dayjs';

const validationSchema = Yup.object({
  client: Yup.string().required('Client is required'),
  program: Yup.string().required('Program is required'),
  enrollment_date: Yup.date().required('Enrollment date is required'),
  is_active: Yup.boolean(),
  facility_name: Yup.string().nullable(),
  mfl_code: Yup.string().nullable(),
  notes: Yup.string().nullable()
});

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
  
  // Get clientId from location state if available (for pre-selection)
  const preselectedClientId = location.state?.clientId || '';

  const initialValues = {
    client: preselectedClientId,
    program: '',
    enrollment_date: dayjs(),
    is_active: true,
    facility_name: '',
    mfl_code: '',
    notes: ''
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients and programs
        const clientsResponse = await axios.get('/api/clients/');
        // Ensure clients is always an array
        const clientsData = clientsResponse.data?.results || clientsResponse.data || [];
        setClients(Array.isArray(clientsData) ? clientsData : []);
        
        const programsResponse = await axios.get('/api/programs/');
        // Ensure programs is always an array
        const programsData = programsResponse.data?.results || programsResponse.data || [];
        setPrograms(Array.isArray(programsData) ? programsData : []);
        
        // If editing, fetch enrollment details
        if (id) {
          const enrollmentResponse = await axios.get(`/api/enrollments/${id}/`);
          const enrollmentData = enrollmentResponse.data;
          
          setEnrollment({
            ...enrollmentData,
            enrollment_date: dayjs(enrollmentData.enrollment_date)
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
      const formattedValues = {
        ...values,
        enrollment_date: values.enrollment_date.format('YYYY-MM-DD')
      };
      
      if (isEditMode) {
        await axios.put(`/api/enrollments/${id}/`, formattedValues);
      } else {
        await axios.post('/api/enrollments/', formattedValues);
      }
      
      // If we came from a client page, go back to the client profile
      if (location.state?.clientId) {
        navigate(`/clients/${location.state.clientId}`);
      } else {
        navigate('/clients');
      }
    } catch (err) {
      setStatus({ error: 'Failed to save enrollment information' });
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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
                      value={values.client}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.client && Boolean(errors.client)}
                      helperText={touched.client && errors.client}
                      disabled={Boolean(preselectedClientId)}
                      required
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.client_id} value={client.client_id}>
                          {client.first_name} {client.last_name} - {client.id_number || 'No ID'}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      id="program"
                      name="program"
                      label="Program"
                      value={values.program}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.program && Boolean(errors.program)}
                      helperText={touched.program && errors.program}
                      required
                    >
                      {programs.map((program) => (
                        <MenuItem key={program.id} value={program.id}>
                          {program.name} ({program.code})
                        </MenuItem>
                      ))}
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