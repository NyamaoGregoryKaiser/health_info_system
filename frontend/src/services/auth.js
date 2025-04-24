import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/user/');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      // Get CSRF token
      await axios.get('/api/auth/csrf/');
      
      // Perform login
      const response = await axios.post('/api/auth/login/', { username, password });
      setUser(response.data);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.detail || 'Login failed. Please check your credentials.'
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout/');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // For development purposes, bypass authentication
  const devLogin = () => {
    setUser({ name: 'Development User', email: 'dev@example.com' });
    setIsAuthenticated(true);
  };

  useEffect(() => {
    // Auto-login for development
    if (process.env.NODE_ENV === 'development') {
      devLogin();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 