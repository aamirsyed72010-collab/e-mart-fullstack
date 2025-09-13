import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import LoadingSpinner from 'components/LoadingSpinner';
import ProductCard from 'components/ProductCard';
import { useWishlist } from 'context/WishlistContext';
import { Container, Grid, Typography, Paper, Button } from '@mui/material';

const WishlistPage = () => {
  const { wishlistItems, loading, error } = useWishlist();

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Your Wishlist
        </Typography>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography color='error'>Error: {error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Your Wishlist
      </Typography>
      {wishlistItems.length === 0 ? (
        <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant='h6' paragraph>
            Your wishlist is empty.
          </Typography>
          <Button component={RouterLink} to='/' variant='contained'>
            Find products you'll love
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid item key={item.product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={item.product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WishlistPage;
