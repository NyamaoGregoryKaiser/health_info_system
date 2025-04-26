import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, Chip,
  Divider, Grid, Paper, CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import programService from '../services/programService';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      try {
        setLoading(true);
        const programData = await programService.getProgram(id);
        setProgram(programData);
        
        // Fetch category details if we have a category ID
        if (programData.category) {
          const categoryData = await programService.getCategories();
          const foundCategory = categoryData.find(cat => cat.id === programData.category);
          if (foundCategory) {
            setCategory(foundCategory);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load program details');
        setLoading(false);
        console.error('Error loading program details:', err);
      }
    };
    
    fetchProgramDetails();
  }, [id]);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
      <CircularProgress />
    </Box>
  );
  
  if (error) return <Typography color="error">{error}</Typography>;
  
  if (!program) return <Typography>Program not found</Typography>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/programs')}
        >
          Back to Programs
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/programs/${id}/edit`)}
        >
          Edit Program
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">{program.name}</Typography>
            <Chip 
              label={program.is_active ? "Active" : "Inactive"} 
              color={program.is_active ? "success" : "default"}
              size="medium"
            />
          </Box>
          
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Program Code: {program.code}
          </Typography>
          
          {category && (
            <Typography variant="subtitle2" gutterBottom>
              Category: {category.name}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Description</Typography>
              <Typography variant="body1" paragraph>
                {program.description || "No description provided."}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Program Details</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Typography variant="body2" fontWeight="bold">Start Date:</Typography>
                  <Typography variant="body2">{program.start_date}</Typography>
                  
                  <Typography variant="body2" fontWeight="bold">End Date:</Typography>
                  <Typography variant="body2">{program.end_date || "Not specified"}</Typography>
                  
                  <Typography variant="body2" fontWeight="bold">Capacity:</Typography>
                  <Typography variant="body2">{program.capacity || "Unlimited"}</Typography>
                  
                  <Typography variant="body2" fontWeight="bold">Location:</Typography>
                  <Typography variant="body2">{program.location || "No location specified"}</Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Eligibility Criteria</Typography>
                <Typography variant="body1">
                  {program.eligibility_criteria || "No specific eligibility criteria."}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProgramDetail; 