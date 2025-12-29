import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const EmptyState = ({ icon, title, message, buttonText, buttonLink }) => {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <Box sx={{ fontSize: '4rem', mb: 2, color: 'text.secondary' }}>
        {icon}
      </Box>
      <Typography variant='h5' gutterBottom>
        {title}
      </Typography>
      <Typography color='text.secondary' paragraph>
        {message}
      </Typography>
      {buttonText && buttonLink && (
        <Button component={RouterLink} to={buttonLink} variant='contained'>
          {buttonText}
        </Button>
      )}
    </Paper>
  );
};

export default EmptyState;
