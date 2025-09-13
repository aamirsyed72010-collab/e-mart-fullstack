import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from 'components/LoadingSpinner';
import { fetchProductById, submitReview } from 'services/api';
import { useCart } from 'context/CartContext';
import { useWishlist } from 'context/WishlistContext';
import { useAuth } from 'context/AuthContext';
import { useNotification } from 'context/NotificationContext';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Rating,
  TextField,
  Avatar,
  Link,
} from '@mui/material';
import { motion } from 'framer-motion';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const { addToCart } = useCart();
  const { addToWishlist, isProductInWishlist } = useWishlist();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);
  const { user, login } = useAuth();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (isAddedToCart) return;
    const success = await addToCart(product._id);
    if (success) {
      setIsAddedToCart(true);
      showNotification('Added to cart!', 'success');
      setTimeout(() => setIsAddedToCart(false), 2000);
    } else {
      showNotification('Failed to add to cart. Please try again.', 'error');
    }
  };

  const handleAddToWishlist = async () => {
    if (isAddedToWishlist || isProductInWishlist(product._id)) return;
    const success = await addToWishlist(product._id);
    if (success) {
      setIsAddedToWishlist(true);
      showNotification('Added to wishlist!', 'success');
      setTimeout(() => setIsAddedToWishlist(false), 2000);
    } else {
      showNotification('Failed to add to wishlist. Please try again.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewRating === 0 || !reviewComment) {
      showNotification('Please provide a rating and a comment.', 'error');
      return;
    }
    try {
      await submitReview(product._id, reviewRating, reviewComment);
      showNotification('Review submitted successfully!', 'success');
      setReviewRating(0);
      setReviewComment('');
      fetchProduct();
    } catch (err) {
      showNotification(err.message || 'Failed to submit review.', 'error');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color='error' align='center'>
          Error: {error}
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography align='center'>Product not found.</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <motion.div
        initial='hidden'
        animate='visible'
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
      >
        <Paper sx={{ p: 4, mb: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.5 }}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    width: '100%',
                    display: 'block',
                    borderRadius: 'inherit',
                  }}
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={6}
              component={motion.div}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                variant='h4'
                component='h1'
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                {product.name}
              </Typography>
              <Typography variant='h5' color='text.secondary' gutterBottom>
                ${product.price.toFixed(2)}
              </Typography>
              <Typography variant='body1' paragraph>
                {product.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  fullWidth
                  variant='contained'
                  onClick={handleAddToCart}
                  disabled={isAddedToCart || product.stock === 0}
                >
                  {product.stock === 0
                    ? 'Out of Stock'
                    : isAddedToCart
                      ? 'Added!'
                      : 'Add to Cart'}
                </Button>
                <Button
                  fullWidth
                  variant='outlined'
                  onClick={handleAddToWishlist}
                  disabled={
                    isAddedToWishlist || isProductInWishlist(product._id)
                  }
                >
                  {isAddedToWishlist || isProductInWishlist(product._id)
                    ? 'In Wishlist'
                    : 'Add to Wishlist'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 4 }}>
          <Typography
            variant='h5'
            component='h2'
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Customer Reviews
          </Typography>
          {product.reviews && product.reviews.length > 0 ? (
            <Grid container spacing={2}>
              {product.reviews.map((review) => (
                <Grid item xs={12} sm={6} key={review._id}>
                  <Paper variant='outlined' sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar
                        src={review.user?.profilePicture}
                        alt={review.user?.displayName}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography variant='subtitle1'>
                          {review.user ? review.user.displayName : 'Anonymous'}
                        </Typography>
                        <Rating value={review.rating} readOnly size='small' />
                      </Box>
                    </Box>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ fontStyle: 'italic' }}
                    >
                      "{review.comment}"
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block', mt: 1, textAlign: 'right' }}
                    >
                      {new Date(review.createdAt).toLocaleDateString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>
              No reviews yet. Be the first to review this product!
            </Typography>
          )}

          <Box component='form' onSubmit={handleReviewSubmit} sx={{ mt: 4 }}>
            <Typography variant='h6' gutterBottom>
              Write a Review
            </Typography>
            {user ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Rating
                    name='review-rating'
                    value={reviewRating}
                    onChange={(event, newValue) => {
                      setReviewRating(newValue);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='Comment'
                    multiline
                    rows={4}
                    fullWidth
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type='submit' variant='contained'>
                    Submit Review
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Typography>
                Please{' '}
                <Link component='button' variant='body1' onClick={login}>
                  log in
                </Link>{' '}
                to write a review.
              </Typography>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default ProductPage;
