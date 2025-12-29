import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { motion } from 'framer-motion';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
} from '@mui/material';

const ProductCard = ({ product, itemVariants }) => {
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isProductInCompare } =
    useComparison();
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
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) => theme.shadows[4],
          },
        }}
      >
        {product.stock === 0 && (
          <Chip
            label='Out of Stock'
            color='error'
            size='small'
            sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1, fontWeight: 600 }}
          />
        )}
        <Box sx={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
            <CardMedia
            component='img'
            image={product.imageUrl}
            alt={product.name}
            sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                }
            }}
            />
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography gutterBottom variant='h6' component='h2' sx={{ fontWeight: 600, mb: 1, fontSize: '1.1rem' }}>
            {product.name}
          </Typography>
          <Typography variant='h6' color='primary' sx={{ fontWeight: 700 }}>
            ${product.price.toFixed(2)}
          </Typography>
        </CardContent>
        <CardActions
          sx={{
            p: 2,
            pt: 0,
            display: 'flex',
            gap: 1,
            flexDirection: 'column',
          }}
        >
          <Button
            component={motion.button}
            whileTap={{ scale: 0.98 }}
            fullWidth
            variant='contained'
            onClick={handleAddToCart}
            disabled={isAdded || product.stock === 0}
            disableElevation
          >
            {product.stock === 0
              ? 'Out of Stock'
              : isAdded
                ? 'Added to Cart'
                : 'Add to Cart'}
          </Button>
          <Button
            fullWidth
            variant='outlined'
            onClick={handleCompareToggle}
            color={isProductInCompare(product._id) ? 'secondary' : 'primary'}
          >
            {isProductInCompare(product._id) ? 'Remove Comparison' : 'Compare'}
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
