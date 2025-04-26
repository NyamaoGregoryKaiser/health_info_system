import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  CircularProgress,
  Box
} from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { dashboardService } from '../services/apiServices';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardSummary();
        // Ensure we have valid data
        if (data && typeof data === 'object') {
          setDashboardData(data);
        } else {
          // If data is invalid, use default empty structure
          setDashboardData({
            clients: { total: 0, new_this_month: 0 },
            programs: { active: 0, total: 0 },
            enrollments: { by_status: [], by_program: [] },
            clients_by_county: []
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
        <Typography variant="h6">{error}</Typography>
      </Paper>
    );
  }

  // Placeholder data if API fails or for development
  const data = dashboardData || {
    clients: { total: 0, new_this_month: 0 },
    programs: { active: 0, total: 0 },
    enrollments: {
      by_status: [],
      by_program: []
    },
    clients_by_county: []
  };

  // Ensure we have all the required properties
  const enrollmentsByStatus = Array.isArray(data?.enrollments?.by_status) ? data.enrollments.by_status : [];
  const enrollmentsByProgram = Array.isArray(data?.enrollments?.by_program) ? data.enrollments.by_program : [];
  const clientsByCounty = Array.isArray(data?.clients_by_county) ? data.clients_by_county : [];

  // Prepare chart data for enrollments by status
  const enrollmentStatusData = {
    labels: enrollmentsByStatus.map(item => item?.status || 'Unknown'),
    datasets: [
      {
        data: enrollmentsByStatus.map(item => item?.count || 0),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FFC107',
          '#F44336',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for enrollments by program
  const enrollmentProgramData = {
    labels: enrollmentsByProgram.map(item => item?.program__name || 'Unknown'),
    datasets: [
      {
        label: 'Enrollments',
        data: enrollmentsByProgram.map(item => item?.count || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for clients by county
  const clientsByCountyData = {
    labels: clientsByCounty.map(item => item?.county || 'Unknown'),
    datasets: [
      {
        label: 'Clients',
        data: clientsByCounty.map(item => item?.count || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography className="dashboard-label" gutterBottom>
                Total Clients
              </Typography>
              <Typography className="dashboard-value">
                {data?.clients?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography className="dashboard-label" gutterBottom>
                New Clients This Month
              </Typography>
              <Typography className="dashboard-value">
                {data?.clients?.new_this_month || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography className="dashboard-label" gutterBottom>
                Active Programs
              </Typography>
              <Typography className="dashboard-value">
                {data?.programs?.active || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <CardContent>
              <Typography className="dashboard-label" gutterBottom>
                Total Programs
              </Typography>
              <Typography className="dashboard-value">
                {data?.programs?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enrollments by Status
              </Typography>
              <div className="dashboard-chart-container">
                {enrollmentsByStatus.length > 0 ? (
                  <Pie data={enrollmentStatusData} />
                ) : (
                  <Typography align="center" color="text.secondary">No enrollment status data available</Typography>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enrollments by Program
              </Typography>
              <div className="dashboard-chart-container">
                {enrollmentsByProgram.length > 0 ? (
                  <Bar 
                    data={enrollmentProgramData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                ) : (
                  <Typography align="center" color="text.secondary">No enrollment program data available</Typography>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Clients by County
              </Typography>
              <div className="dashboard-chart-container">
                {clientsByCounty.length > 0 ? (
                  <Bar 
                    data={clientsByCountyData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                ) : (
                  <Typography align="center" color="text.secondary">No client county data available</Typography>
                )}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
} 