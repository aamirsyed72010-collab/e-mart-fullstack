import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from 'context/CartContext';
import { placeOrder } from 'services/api';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';

const steps = ['Shipping details', 'Confirm order'];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    houseNo: '',
    streetName: '',
    address: '',
    city: '',
    district: '',
    taluk: '',
    postalCode: '',
    country: 'India',
  });

  const handleChange = (e) => {
    setShippingDetails({ ...shippingDetails, [e.target.name]: e.target.value });
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (
      Object.values(shippingDetails).some(
        (detail) => detail === '' && detail !== shippingDetails.address
      )
    ) {
      alert('Please fill in all required shipping details.');
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      navigate('/');
      return;
    }
    try {
      await placeOrder(shippingDetails);
      alert('Order Placed Successfully!');
      clearCart();
      navigate('/account');
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order: ${error.message}`);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <Box component='form' onSubmit={handleNext}>
            <Alert severity='warning' sx={{ mb: 2 }}>
              Currently, our services are exclusively available within India.
            </Alert>
            <Typography variant='h6' gutterBottom>
              Shipping Details
            </Typography>
            <Grid container spacing={2}>
              {Object.keys(shippingDetails).map((key) => (
                <Grid item xs={12} sm={6} key={key}>
                  <TextField
                    required={key !== 'address'}
                    fullWidth
                    label={
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, ' $1')
                    }
                    name={key}
                    value={shippingDetails[key]}
                    onChange={handleChange}
                  />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button type='submit' variant='contained'>
                Next
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <>
            <Typography variant='h6' gutterBottom>
              Order Summary
            </Typography>
            <List disablePadding>
              {cartItems.map((item) => (
                <ListItem key={item.product._id} sx={{ py: 1, px: 0 }}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`Quantity: ${item.quantity}`}
                  />
                  <Typography variant='body2'>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
              <Divider />
              <ListItem sx={{ py: 1, px: 0 }}>
                <ListItemText primary='Total' />
                <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>
                  ${total.toFixed(2)}
                </Typography>
              </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant='h6' gutterBottom>
              Shipping To:
            </Typography>
            <Typography gutterBottom>{shippingDetails.fullName}</Typography>
            <Typography gutterBottom>
              {shippingDetails.houseNo}, {shippingDetails.streetName}
            </Typography>
            <Typography gutterBottom>
              {shippingDetails.city}, {shippingDetails.postalCode}
            </Typography>
            <Typography gutterBottom>{shippingDetails.country}</Typography>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}
            >
              <Button onClick={handleBack}>Back</Button>
              <Button variant='contained' onClick={handlePlaceOrder}>
                Place Order
              </Button>
            </Box>
          </>
        );
      default:
        throw new Error('Unknown step');
    }
  }

  return (
    <Container component='main' maxWidth='sm' sx={{ mb: 4 }}>
      <Paper
        variant='outlined'
        sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
      >
        <Typography component='h1' variant='h4' align='center'>
          Checkout
        </Typography>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default CheckoutPage;
