import React from 'react';

import LoadingSpinner from 'components/LoadingSpinner';
import ProductCard from 'components/ProductCard';
import EmptyState from 'components/EmptyState';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { useWishlist } from 'context/WishlistContext';
import { Container, Typography } from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';

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
        <EmptyState
          icon={<FavoriteIcon fontSize='inherit' />}
          title='Your wishlist is empty'
          message='You can add items to your wishlist by clicking the heart icon on a product.'
          buttonText='Find products'
          buttonLink='/'
        />
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid key={item.product._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={item.product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default WishlistPage;
