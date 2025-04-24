import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Function to check if user is authenticated
  const checkAuth = async () => {
    try {
      // Access the API endpoint directly without the auth prefix
      const response = await api.get('/auth/user/');
      
      if (!response.data || Object.keys(response.data).length === 0) {
        console.warn('Empty user data received from server');
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('isAuthenticated');
        return false;
      }
      
      console.log('Auth response:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.log('Not authenticated or server error', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in when app loads
    checkAuth();
  }, []);

  // Authenticate user and store token
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/login/', credentials);
      
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        
        setIsAuthenticated(true);
        
        // Fetch user data immediately after successful login
        const userData = await checkAuth();
        
        // Return success with user data
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.non_field_errors?.[0] || 
        error.message || 
        'Authentication failed';
      
      // Clear any partial auth data
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user and clear stored data
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint if user is authenticated
      if (isAuthenticated) {
        try {
          await api.post('/auth/logout/');
        } catch (logoutError) {
          console.warn('Logout API call failed:', logoutError);
          // Continue with local logout even if API call fails
        }
      }
      
      // Clear authentication state
      setIsAuthenticated(false);
      setUser(null);
      
      // Remove stored tokens
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      
      // Redirect user to login page
      window.location.href = '/login';
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still redirect even if there was an error
      window.location.href = '/login';
      
      return { success: false, error: error.message || 'Logout failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Development login helper - only works in development mode
  const devLogin = async (userData = { username: 'testuser', is_staff: true }) => {
    // Only allow in development environment
    if (process.env.NODE_ENV !== 'development') {
      console.error('Dev login is only available in development mode');
      return false;
    }

    try {
      setIsLoading(true);
      console.log('Development login activated with user:', userData);
      
      // Mock successful login
      setUser(userData);
      setIsAuthenticated(true);
      
      // Store authentication state
      localStorage.setItem('isAuthenticated', 'true');
      
      // Mock token for development
      const mockToken = 'dev-mock-token-' + Date.now();
      localStorage.setItem('token', mockToken);
      
      return true;
    } catch (error) {
      console.error('Development login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      logout,
      checkAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 