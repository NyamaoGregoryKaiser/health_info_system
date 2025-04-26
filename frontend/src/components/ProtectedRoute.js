import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Double-check authentication status when protected routes are accessed
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      if (!isAuth) {
        navigate('/login', { replace: true });
      }
    };
    
    if (!loading && !isAuthenticated) {
      verifyAuth();
    }
  }, [checkAuth, isAuthenticated, loading, navigate]);

  // Show loading indicator while checking authentication status
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute; 