import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { fetchRecommendations as apiFetchRecommendations } from 'services/api';
import { Box, Grid, Typography } from '@mui/material';

const Recommendations = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await apiFetchRecommendations(productId);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (recommendations.length === 0) {
    return null; // Don't render anything if there are no recommendations
  }

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 'bold' }}>
        You Might Also Like
      </Typography>
      <Grid container spacing={3}>
        {recommendations.map(product => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Recommendations;