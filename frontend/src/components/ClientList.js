import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { clientService } from '../services/apiServices';

export default function ClientList() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [countyFilter, setCountyFilter] = useState('');
  const [counties, setCounties] = useState([]);
  
  const navigate = useNavigate();

  // Use useCallback to memoize the fetchClients function
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await clientService.getAllClients();
      // Ensure clients is always an array
      const clientsData = response?.results || response || [];
      setClients(Array.isArray(clientsData) ? clientsData : []);
      
      // Extract unique counties for filter dropdown
      const uniqueCounties = Array.isArray(clientsData) 
        ? [...new Set(clientsData.filter(client => client && client.county).map(client => client.county))]
        : [];
      setCounties(uniqueCounties);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again later.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients, countyFilter]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchClients();
      return;
    }
    
    try {
      setLoading(true);
      const response = await clientService.searchClients(searchQuery);
      // Ensure results is always an array
      const resultsData = response?.results || response || [];
      setClients(Array.isArray(resultsData) ? resultsData : []);
    } catch (err) {
      console.error('Error searching clients:', err);
      setError('Failed to search clients. Please try again later.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.deleteClient(id);
        // Refresh the client list
        fetchClients();
      } catch (err) {
        console.error('Error deleting client:', err);
        setError('Failed to delete client. Please try again later.');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply client filtering for search - ensuring filteredClients is always an array
  let filteredClients = [];
  if (Array.isArray(clients)) {
    filteredClients = searchQuery 
      ? clients.filter(client => 
          client?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client?.national_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client?.phone_number?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : clients;
  }
    
  // Apply pagination - ensuring filteredClients is an array before calling slice
  const paginatedClients = Array.isArray(filteredClients) ? 
    filteredClients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) : [];

  return (
    <div>
      <Box className="page-header">
        <Typography variant="h4" component="h1" className="page-title">
          Clients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')}
        >
          Add New Client
        </Button>
      </Box>

      <Card className="content-card">
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search Clients"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Filter by County</InputLabel>
                <Select
                  value={countyFilter}
                  onChange={(e) => setCountyFilter(e.target.value)}
                  label="Filter by County"
                >
                  <MenuItem value="">All Counties</MenuItem>
                  {counties.map((county) => (
                    <MenuItem key={county} value={county}>{county}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
              <Typography variant="h6">{error}</Typography>
            </Paper>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>ID Number</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>County</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedClients.length > 0 ? (
                      paginatedClients.map((client) => (
                        <TableRow key={client.id || client.client_id}>
                          <TableCell>
                            {client.first_name} {client.last_name}
                          </TableCell>
                          <TableCell>{client.national_id || client.id_number}</TableCell>
                          <TableCell>{client.phone_number}</TableCell>
                          <TableCell>{client.county}</TableCell>
                          <TableCell>
                            {client.gender === 'M' ? 'Male' : client.gender === 'F' ? 'Female' : 'Other'}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              component={Link}
                              to={`/clients/${client.id || client.client_id}`}
                              color="primary"
                            >
                              <ViewIcon />
                            </IconButton>
                            <IconButton
                              component={Link}
                              to={`/clients/${client.id || client.client_id}/edit`}
                              color="secondary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(client.id || client.client_id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No clients found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={Array.isArray(filteredClients) ? filteredClients.length : 0}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 