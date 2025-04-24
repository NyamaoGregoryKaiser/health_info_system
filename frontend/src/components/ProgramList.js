import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, Chip,
  Paper, IconButton, Tooltip, Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const ProgramList = () => {
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const programsResponse = await axios.get('/api/programs/');
        // Make sure we have an array, even if the response is different
        const programsData = programsResponse.data?.results || programsResponse.data || [];
        setPrograms(Array.isArray(programsData) ? programsData : []);
        
        const categoriesResponse = await axios.get('/api/program-categories/');
        const categoriesData = categoriesResponse.data?.results || categoriesResponse.data || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load programs');
        setLoading(false);
        console.error('Error loading programs:', err);
      }
    };
    
    fetchPrograms();
  }, []);

  // Create programsByCategory object safely
  const programsByCategory = {};
  
  // Only try to reduce if programs is an array
  if (Array.isArray(programs) && programs.length > 0) {
    programs.forEach(program => {
      const categoryId = program.category;
      if (categoryId) {  // Only process if category ID exists
        if (!programsByCategory[categoryId]) {
          programsByCategory[categoryId] = [];
        }
        programsByCategory[categoryId].push(program);
      }
    });
  }

  if (loading) return <Typography>Loading programs...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Health Programs</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/programs/new')}
        >
          Add Program
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Typography>No program categories found. Please create categories first.</Typography>
      ) : (
        categories.map(category => (
          <Card key={category.id} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>{category.name}</Typography>
              
              {programsByCategory[category.id]?.length > 0 ? (
                <Grid container spacing={2}>
                  {programsByCategory[category.id].map(program => (
                    <Grid item xs={12} sm={6} md={4} key={program.id}>
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 2, 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column' 
                        }}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle1" fontWeight="bold">
                            {program.name}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={program.is_active ? "Active" : "Inactive"} 
                            color={program.is_active ? "success" : "default"}
                          />
                        </Box>
                        
                        <Typography variant="caption" color="textSecondary">
                          Code: {program.code}
                        </Typography>
                        
                        <Typography variant="body2" sx={{ mt: 1, mb: 1, flexGrow: 1 }}>
                          {program.description?.length > 100 
                            ? `${program.description.substring(0, 100)}...` 
                            : program.description}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption">
                            Start: {program.start_date}
                            {program.end_date && ` ⟶ End: ${program.end_date}`}
                          </Typography>
                          
                          <Box>
                            <Tooltip title="Edit Program">
                              <IconButton 
                                size="small" 
                                onClick={() => navigate(`/programs/${program.id}/edit`)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Program Details">
                              <IconButton 
                                size="small"
                                onClick={() => navigate(`/programs/${program.id}`)}
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2">No programs in this category</Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default ProgramList;