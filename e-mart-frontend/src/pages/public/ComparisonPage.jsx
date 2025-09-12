import React, { useState, useEffect, useCallback } from 'react';
import { useComparison } from '../../context/ComparisonContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchProductsForComparison } from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from '@mui/material';

const ComparisonPage = () => {
  const { comparisonList, removeFromCompare, clearCompareList } = useComparison();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProductsForComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (comparisonList.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchProductsForComparison(comparisonList);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [comparisonList]);

  useEffect(() => {
    loadProductsForComparison();
  }, [loadProductsForComparison]);

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Comparison
        </Typography>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Product Comparison
        </Typography>
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant="h6" paragraph>
            No products selected for comparison.
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Start Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  const allAttributes = Array.from(new Set(products.flatMap(product => Object.keys(product))));
  const comparableAttributes = allAttributes.filter(attr => 
    !['_id', '__v', 'seller', 'reviews', 'createdAt', 'updatedAt', 'views', 'sales', 'imageUrl', 'name']
    .includes(attr) &&
    typeof products[0][attr] !== 'object'
  ).sort();

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Product Comparison
      </Typography>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        {products.length > 0 && (
          <Button variant="contained" color="error" onClick={clearCompareList}>
            Clear All
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Attribute</TableCell>
              {products.map(product => (
                <TableCell key={product._id} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <Box
                      component="img"
                      src={product.imageUrl}
                      alt={product.name}
                      sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Link component={RouterLink} to={`/product/${product._id}`} variant="subtitle2">
                      {product.name}
                    </Link>
                    <Button size="small" color="error" onClick={() => removeFromCompare(product._id)}>
                      Remove
                    </Button>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {comparableAttributes.map((attr) => (
              <TableRow key={attr}>
                <TableCell component="th" scope="row">
                  {attr.charAt(0).toUpperCase() + attr.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                </TableCell>
                {products.map(product => (
                  <TableCell key={product._id} align="center">
                    {attr === 'price' ? `$${product[attr].toFixed(2)}` : (Array.isArray(product[attr]) ? product[attr].join(', ') : product[attr])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ComparisonPage;