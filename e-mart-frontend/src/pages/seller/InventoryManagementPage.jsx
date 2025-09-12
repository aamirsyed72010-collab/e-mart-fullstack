import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchSellerProducts, updateProductStock } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
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
  TextField,
  Button,
  Avatar,
  Box,
  Alert,
} from '@mui/material';

const InventoryManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const [stockLevels, setStockLevels] = useState({});

  const loadSellerProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSellerProducts();
      setProducts(data);
      const initialStock = {};
      data.forEach(p => {
        initialStock[p._id] = p.stock;
      });
      setStockLevels(initialStock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSellerProducts();
  }, [loadSellerProducts]);

  const handleStockChange = (productId, value) => {
    setStockLevels(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleUpdateStock = async (productId) => {
    const newStock = stockLevels[productId];
    if (newStock === '' || isNaN(newStock) || newStock < 0) {
      showNotification('Please enter a valid stock number.', 'error');
      return;
    }

    try {
      await updateProductStock(productId, parseInt(newStock, 10));
      showNotification('Stock updated successfully!', 'success');
      loadSellerProducts();
    } catch (err) {
      showNotification(err.message || 'Failed to update stock.', 'error');
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Inventory Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? <LoadingSpinner /> : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="center">Update Stock</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar src={product.imageUrl} alt={product.name} variant="square" sx={{ mr: 2 }} />
                        <Typography>{product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">{product.stock}</TableCell>
                    <TableCell align="center">
                      <TextField 
                        type="number"
                        value={stockLevels[product._id] || ''}
                        onChange={(e) => handleStockChange(product._id, e.target.value)}
                        sx={{ width: '100px' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="contained"
                        onClick={() => handleUpdateStock(product._id)}
                      >
                        Update
                      </Button>
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

export default InventoryManagementPage;