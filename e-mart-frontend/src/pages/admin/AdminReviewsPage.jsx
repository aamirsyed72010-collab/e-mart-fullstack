import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchAdminProducts, deleteAdminReview } from '../../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Rating,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AdminReviewsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchProductsWithReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProducts();
      setProducts(data.filter(p => p.reviews && p.reviews.length > 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsWithReviews();
  }, [fetchProductsWithReviews]);

  const handleDelete = async (productId, reviewId) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        await deleteAdminReview(productId, reviewId);
        setMessage('Review deleted successfully.');
        fetchProductsWithReviews();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Review Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? <LoadingSpinner /> : (
          <Box>
            {products.length === 0 ? (
              <Typography align="center">No reviews found.</Typography>
            ) : (
              products.map(product => (
                <Accordion key={product._id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{product.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {product.reviews.map(review => (
                        <ListItem
                          key={review._id}
                          secondaryAction={
                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(product._id, review._id)} color="error">
                              <Delete />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={<><Typography component="span" sx={{ fontWeight: 'bold' }}>{review.user}</Typography> - <Rating value={review.rating} readOnly size="small" /></>}
                            secondary={
                              <>
                                <Typography variant="body2" color="text.primary">{review.comment}</Typography>
                                <Typography variant="caption" color="text.secondary">{new Date(review.createdAt).toLocaleString()}</Typography>
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              ))
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminReviewsPage;