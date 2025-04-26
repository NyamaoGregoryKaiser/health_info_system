import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Paper,
  Grid
} from '@mui/material';
import { 
  Login as LoginIcon, 
  PersonAdd as RegisterIcon,
  Healing as HealingIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(45deg, #0e7c61 30%, #3AB795 90%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3
      }}
    >
      <Container maxWidth="md">
        <Paper 
          elevation={5}
          sx={{ 
            padding: 5, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <HealingIcon sx={{ fontSize: 60, color: '#0e7c61', mb: 2 }} />
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#0e7c61', mb: 1 }}>
                  Afya Yetu
                </Typography>
                <Typography variant="h5" component="h2" sx={{ mb: 3, color: '#555' }}>
                  Health Information System
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
                Empowering communities through accessible healthcare programs and services.
                Join us in our mission to improve health outcomes across the nation.
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
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
                  Login
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<RegisterIcon />}
                  onClick={() => navigate('/register')}
                  sx={{ 
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#0e7c61',
                    color: '#0e7c61',
                    '&:hover': {
                      borderColor: '#0a5f4a',
                      backgroundColor: 'rgba(14, 124, 97, 0.05)'
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/health-illustration.svg" 
                alt="Health services illustration"
                sx={{ 
                  width: '100%',
                  height: 'auto',
                  maxHeight: 350,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://source.unsplash.com/random/?healthcare,medical';
                }}
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ textAlign: 'center', mt: 4, color: 'white' }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Afya Yetu Health System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage; 