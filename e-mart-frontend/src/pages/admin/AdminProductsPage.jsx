import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchAdminProducts, deleteAdminProduct } from '../../services/api';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Box,
  IconButton,
  Alert,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete this product?'
      )
    ) {
      try {
        await deleteAdminProduct(productId);
        setMessage('Product deleted successfully.');
        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom align='center'>
        Product Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        {message && (
          <Alert severity='success' sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Seller</TableCell>
                  <TableCell align='right'>Price</TableCell>
                  <TableCell align='right'>Stock</TableCell>
                  <TableCell align='right'>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={product.imageUrl}
                          alt={product.name}
                          variant='square'
                          sx={{ mr: 2 }}
                        />
                        <Typography>{product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {product.seller?.displayName || 'N/A'}
                    </TableCell>
                    <TableCell align='right'>
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell align='right'>{product.stock}</TableCell>
                    <TableCell align='right'>
                      <IconButton
                        onClick={() => handleDelete(product._id)}
                        color='error'
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default AdminProductsPage;
