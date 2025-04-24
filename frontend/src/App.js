import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Components
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';
import ClientProfile from './components/ClientProfile';
import ClientForm from './components/ClientForm';
import ProgramList from './components/ProgramList';
import ProgramForm from './components/ProgramForm';
import EnrollmentForm from './components/EnrollmentForm';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AppLayout from './layouts/AppLayout';

// Services
import { AuthProvider } from './services/auth';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <CssBaseline />
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes - will redirect to login if not authenticated */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* Client Routes */}
                <Route path="clients" element={<ClientList />} />
                <Route path="clients/new" element={<ClientForm />} />
                <Route path="clients/:id" element={<ClientProfile />} />
                <Route path="clients/:id/edit" element={<ClientForm />} />
                
                {/* Program Routes */}
                <Route path="programs" element={<ProgramList />} />
                <Route path="programs/new" element={<ProgramForm />} />
                <Route path="programs/:id/edit" element={<ProgramForm />} />
                
                {/* Enrollment Routes */}
                <Route path="enrollments/new" element={<EnrollmentForm />} />
                <Route path="enrollments/:id/edit" element={<EnrollmentForm />} />
              </Route>
            </Route>
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App; 