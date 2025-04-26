import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from './apiServices';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to check if user is authenticated
  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...');
      
      // Check if we have authentication in localStorage
      if (localStorage.getItem('isAuthenticated') === 'true') {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData && Object.keys(userData).length > 0) {
          console.log('Auth response from localStorage:', userData);
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return true;
        }
      }
      
      // If localStorage check failed, try the service
      try {
        const userData = await authService.getUserInfo();
        
        if (!userData || Object.keys(userData).length === 0) {
          console.warn('Empty user data received from server');
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('token');
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('userData');
          setLoading(false);
          return false;
        }
        
        console.log('Auth response from API:', userData);
        setUser(userData);
        setIsAuthenticated(true);
        // Update localStorage with the latest data
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        setLoading(false);
        return true;
      } catch (apiError) {
        console.warn('API auth check failed:', apiError);
        // Continue with local data if API check fails
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.log('Not authenticated or server error', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    // Check if user is already logged in when app loads
    const checkAuthOnLoad = async () => {
      if (localStorage.getItem('isAuthenticated') === 'true') {
        await checkAuth();
      } else {
        setLoading(false);
      }
    };
    
    checkAuthOnLoad();
  }, []);

  // Authenticate user and store token
  const login = async (username, password) => {
    try {
      console.log('Attempting login with username:', username);
      
      // Use the auth service for login
      const userData = await authService.login(username, password);
      
      if (userData && userData.success) {
        console.log('Login successful:', userData);
        setIsAuthenticated(true);
        
        // Update user data
        setUser(userData.user);
        
        // Store authentication state for app refresh
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(userData.user));
        
        return { success: true, user: userData.user };
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
      localStorage.removeItem('isAuthenticated');
      
      return { success: false, message: errorMessage };
    }
  };

  // Logout user and clear stored data
  const logout = async () => {
    try {
      // Call logout endpoint if user is authenticated
      if (isAuthenticated) {
        try {
          await authService.logout();
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
      localStorage.removeItem('userData');
      
      // Redirect user to landing page
      window.location.href = '/';
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Still redirect even if there was an error
      window.location.href = '/';
      
      return { success: false, error: error.message || 'Logout failed' };
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