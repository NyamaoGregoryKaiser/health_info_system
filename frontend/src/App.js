import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Toaster } from 'react-hot-toast';

// Components
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientProfile from './components/ClientProfile';
import ClientForm from './components/ClientForm';
import ProgramList from './components/ProgramList';
import ProgramDetail from './components/ProgramDetail';
import ProgramForm from './components/ProgramForm';
import EnrollmentList from './components/EnrollmentList';
import EnrollmentForm from './components/EnrollmentForm';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AppLayout from './layouts/AppLayout';

// Services
import { AuthProvider, useAuth } from './services/auth';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0e7c61',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

// Conditional redirect component
const ConditionalRedirect = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null;
  
  return isAuthenticated 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#0e7c61',
              },
            },
            error: {
              style: {
                background: '#e53935',
              },
            },
          }} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - will redirect to login if not authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Client Routes */}
                <Route path="clients" element={<ClientList />} />
                <Route path="clients/new" element={<ClientForm />} />
                <Route path="clients/:id" element={<ClientProfile />} />
                <Route path="clients/:id/edit" element={<ClientForm />} />
                
                {/* Program Routes */}
                <Route path="programs" element={<ProgramList />} />
                <Route path="programs/new" element={<ProgramForm />} />
                <Route path="programs/:id" element={<ProgramDetail />} />
                <Route path="programs/:id/edit" element={<ProgramForm />} />
                
                {/* Enrollment Routes */}
                <Route path="enrollments" element={<EnrollmentList />} />
                <Route path="enrollments/new" element={<EnrollmentForm />} />
                <Route path="enrollments/:id/edit" element={<EnrollmentForm />} />
              </Route>
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<ConditionalRedirect />} />
          </Routes>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 