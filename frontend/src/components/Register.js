import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Paper, 
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { clientService } from '../services/apiServices';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: null,
    gender: '',
    phone_number: '',
    email: '',
    national_id: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    username: '',
    password: '',
    password_confirm: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      date_of_birth: date
    }));
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name) {
      setError('First name and last name are required');
      return false;
    }

    if (!formData.date_of_birth) {
      setError('Date of birth is required');
      return false;
    }

    if (!formData.gender) {
      setError('Gender is required');
      return false;
    }
    
    if (!formData.phone_number) {
      setError('Phone number is required');
      return false;
    }
    
    if (!formData.national_id) {
      setError('National ID is required');
      return false;
    }
    
    if (!formData.username) {
      setError('Username is required');
      return false;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return false;
    }
    
    // Email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Invalid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format date for backend
      const formattedData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? dayjs(formData.date_of_birth).format('YYYY-MM-DD') : null,
      };
      
      // Remove password_confirm as backend doesn't need it
      const { password_confirm, ...dataToSubmit } = formattedData;
      
      // Use the client service for registration without saving response variable
      await clientService.registerClient(dataToSubmit);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.detail || error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #0e7c61 30%, #3AB795 90%)',
        py: 4
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 2, 
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={() => navigate('/')} 
              sx={{ mr: 1 }}
              aria-label="back to home"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 500 }}>
              <PersonAddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Client Registration
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>Registration successful! Redirecting to login...</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="first_name"
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="last_name"
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.date_of_birth}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                  maxDate={dayjs()}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  name="gender"
                  label="Gender"
                  value={formData.gender}
                  onChange={handleChange}
                  fullWidth
                  required
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="phone_number"
                  label="Phone Number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="national_id"
                  label="National ID"
                  value={formData.national_id}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Emergency Contact</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="emergency_contact_name"
                  label="Emergency Contact Name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="emergency_contact_phone"
                  label="Emergency Contact Phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  fullWidth
                />
              </Grid>
            </Grid>
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Account Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="username"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="password_confirm"
                  label="Confirm Password"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: '#0e7c61',
                  color: '#0e7c61'
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: '#0e7c61',
                  '&:hover': {
                    backgroundColor: '#0a5f4a'
                  }
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account? <Link to="/login" style={{ color: '#0e7c61' }}>Sign in</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 