import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { 
  Box, Button, TextField, Typography, 
  Alert, Container, Paper, CircularProgress, IconButton
} from '@mui/material';
import { 
  LockOutlined as LockOutlinedIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { useAuth } from '../services/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, checkAuth } = useAuth();
  const navigate = useNavigate();

  // Check authentication status when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const isAuth = await checkAuth();
        if (isAuth) {
          // If authenticated, navigate to dashboard instead of home
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error verifying authentication:", err);
      }
    };
    
    verifyAuth();
  }, [navigate, checkAuth]);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        // Navigate to dashboard after successful login
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Login submission error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #0e7c61 30%, #3AB795 90%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'absolute', top: 10, left: 10 }}>
            <IconButton
              onClick={() => navigate('/')}
              aria-label="back to home"
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
          
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 50,
              height: 50,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <LockOutlinedIcon />
          </Box>
          
          <Typography component="h1" variant="h5" gutterBottom>
            Afya Yetu Health System
          </Typography>
          
          <Typography component="h2" variant="h6" gutterBottom>
            Sign In
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account? <Link to="/register" style={{ color: '#0e7c61' }}>Register here</Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 