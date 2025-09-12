import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { motion } from 'framer-motion';
import { Card, CardMedia, CardContent, CardActions, Typography, Button, Chip } from '@mui/material';

const ProductCard = ({ product, itemVariants }) => {
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isProductInCompare } = useComparison();
  const [isAdded, setIsAdded] = useState(false);

  const handleCompareToggle = () => {
    if (isProductInCompare(product._id)) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product._id);
    }
  };

  const handleAddToCart = async () => {
    if (isAdded) return;

    const success = await addToCart(product._id);
    if (success) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } else {
      alert('Failed to add item. Please try again.');
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <Card sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}>
        {product.stock === 0 && (
          <Chip
            label="Out of Stock"
            color="error"
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
          />
        )}
        <CardMedia
          component="img"
          height="140"
          image={product.imageUrl}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2">
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ${product.price.toFixed(2)}
          </Typography>
        </CardContent>
        <CardActions sx={{ display: 'flex', flexDirection: 'column', p: 2, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddToCart}
            disabled={isAdded || product.stock === 0}
            sx={{ mb: 1 }}
          >
            {product.stock === 0 ? 'Out of Stock' : (isAdded ? 'Added!' : 'Add to Cart')}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleCompareToggle}
            color={isProductInCompare(product._id) ? "secondary" : "primary"}
          >
            {isProductInCompare(product._id) ? 'In Comparison' : 'Compare'}
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProductCard;