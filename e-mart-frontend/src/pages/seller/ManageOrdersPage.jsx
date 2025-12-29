import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchSellerOrders, updateSellerOrderStatus } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Container,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ManageOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSellerOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusChange = useCallback(
    async (orderId, newStatus) => {
      try {
        await updateSellerOrderStatus(orderId, newStatus);
        showNotification('Order status updated successfully!', 'success');
        loadOrders();
      } catch (err) {
        showNotification(
          err.message || 'Failed to update order status.',
          'error'
        );
      }
    },
    [showNotification, loadOrders]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Typography color='error'>{error}</Typography>;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Manage Your Orders
      </Typography>
      <Paper sx={{ p: 3 }}>
        {orders.length === 0 ? (
          <Typography>You have no orders yet.</Typography>
        ) : (
          orders.map((order) => (
            <Accordion key={order._id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Order #{order._id} - Total: ${order.totalAmount.toFixed(2)} -
                  Status:{' '}
                  <Chip
                    label={order.status}
                    color={
                      order.status === 'delivered'
                        ? 'success'
                        : order.status === 'cancelled'
                          ? 'error'
                          : 'info'
                    }
                    size='small'
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <Typography variant='h6' gutterBottom>
                      Customer Details
                    </Typography>
                    <Typography>Name: {order.user.displayName}</Typography>
                    <Typography>Email: {order.user.email}</Typography>
                    <Typography variant='h6' sx={{ mt: 2 }} gutterBottom>
                      Shipping Address
                    </Typography>
                    <Typography>{order.shippingAddress.fullName}</Typography>
                    <Typography>
                      {order.shippingAddress.houseNo},{' '}
                      {order.shippingAddress.streetName}
                    </Typography>
                    <Typography>
                      {order.shippingAddress.city},{' '}
                      {order.shippingAddress.postalCode}
                    </Typography>
                    <Typography>
                      {order.shippingAddress.district},{' '}
                      {order.shippingAddress.taluk}
                    </Typography>
                    <Typography>{order.shippingAddress.country}</Typography>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <Typography variant='h6' gutterBottom>
                      Order Items
                    </Typography>
                    <List>
                      {order.items.map((item) => (
                        <ListItem key={item.product._id} disablePadding>
                          <ListItemAvatar>
                            <Avatar
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              variant='square'
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.product.name}
                            secondary={`Quantity: ${item.quantity} | Price: ${item.price.toFixed(2)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant='h6' sx={{ mt: 2 }}>
                      Total: ${order.totalAmount.toFixed(2)}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Update Status</InputLabel>
                        <Select
                          value={order.status}
                          label='Update Status'
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value)
                          }
                        >
                          <MenuItem value='pending'>Pending</MenuItem>
                          <MenuItem value='processing'>Processing</MenuItem>
                          <MenuItem value='shipped'>Shipped</MenuItem>
                          <MenuItem value='delivered'>Delivered</MenuItem>
                          <MenuItem value='cancelled'>Cancelled</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default ManageOrdersPage;
