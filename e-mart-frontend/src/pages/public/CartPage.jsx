import React from 'react';
import { useCart } from 'context/CartContext';
import { Link as RouterLink } from 'react-router-dom';
import LoadingSpinner from 'components/LoadingSpinner';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  TextField,
  Divider,
} from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

const CartPage = () => {
  const { cartItems, loading, updateCartItemQuantity, removeCartItem } =
    useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity >= 1) {
      await updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeCartItem(productId);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Your Shopping Cart
        </Typography>
        <LoadingSpinner />
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Your Shopping Cart
        </Typography>
        <Paper sx={{ p: 4, mt: 4 }}>
          <Typography variant='h6' paragraph>
            Your cart is currently empty.
          </Typography>
          <Button component={RouterLink} to='/' variant='contained'>
            Continue Shopping
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Your Shopping Cart
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Paper>
            <List>
              {cartItems.map((item, index) => (
                <React.Fragment key={item.product._id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        variant='square'
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.product.name}
                      secondary={`$${item.product.price.toFixed(2)}`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size='small'
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity - 1
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        type='number'
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.product._id,
                            parseInt(e.target.value, 10)
                          )
                        }
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{ width: '50px' }}
                      />
                      <IconButton
                        size='small'
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity + 1
                          )
                        }
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Typography variant='h6' sx={{ mx: 2 }}>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                    <IconButton
                      edge='end'
                      aria-label='delete'
                      onClick={() => handleRemoveItem(item.product._id)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                  {index < cartItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Order Summary
            </Typography>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography>Subtotal</Typography>
              <Typography>${total.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography>Shipping</Typography>
              <Typography>FREE</Typography>
            </Box>
            <Divider />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 2,
                mb: 2,
              }}
            >
              <Typography variant='h6'>Total</Typography>
              <Typography variant='h6'>${total.toFixed(2)}</Typography>
            </Box>
            <Button
              component={RouterLink}
              to='/checkout'
              variant='contained'
              fullWidth
            >
              Proceed to Checkout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;
