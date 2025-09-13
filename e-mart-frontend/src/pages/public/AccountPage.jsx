import React, { useState, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import {
  updateUserProfile,
  fetchOrders,
  fetchSellerRequestStatus,
  fetchAdminRequestStatus,
  requestSellerRole,
  requestAdminRole,
} from 'services/api';
import {
  Container,
  Typography,
  Paper,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AccountPage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    shippingAddress: {
      fullName: '',
      houseNo: '',
      streetName: '',
      address: '',
      city: '',
      district: '',
      taluk: '',
      postalCode: '',
      country: '',
    },
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [sellerRequestStatus, setSellerRequestStatus] = useState('none');
  const [adminRequestStatus, setAdminRequestStatus] = useState('none');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [sellerRequestForm, setSellerRequestForm] = useState({
    phoneNumber: '',
    address: '',
    desiredCategories: [],
  });
  const [adminRequestReason, setAdminRequestReason] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        shippingAddress: {
          fullName: user.shippingAddress?.fullName || '',
          houseNo: user.shippingAddress?.houseNo || '',
          streetName: user.shippingAddress?.streetName || '',
          address: user.shippingAddress?.address || '',
          city: user.shippingAddress?.city || '',
          district: user.shippingAddress?.district || '',
          taluk: user.shippingAddress?.taluk || '',
          postalCode: user.shippingAddress?.postalCode || '',
          country: user.shippingAddress?.country || '',
        },
      });

      const getOrders = async () => {
        setOrdersLoading(true);
        try {
          const data = await fetchOrders();
          setOrders(data);
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      };
      getOrders();

      const getRequestStatuses = async () => {
        try {
          const sellerStatus = await fetchSellerRequestStatus();
          setSellerRequestStatus(sellerStatus.status);
          const adminStatus = await fetchAdminRequestStatus();
          setAdminRequestStatus(adminStatus.status);
        } catch (err) {
          console.error('Failed to fetch request statuses:', err);
        }
      };
      getRequestStatuses();
    }
  }, [user]);

  const handleSellerRequestFormChange = (e) => {
    const { name, value } = e.target;
    setSellerRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSellerCategoriesChange = (e) => {
    const { value, checked } = e.target;
    setSellerRequestForm((prev) => {
      const newCategories = checked
        ? [...prev.desiredCategories, value]
        : prev.desiredCategories.filter((cat) => cat !== value);
      return { ...prev, desiredCategories: newCategories };
    });
  };

  const handleSellerRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestMessage('');
    setRequestError('');
    try {
      await requestSellerRole(sellerRequestForm);
      setRequestMessage('Seller request submitted successfully!');
      setSellerRequestStatus('pending');
    } catch (err) {
      setRequestError(err.message || 'Failed to submit seller request.');
    }
  };

  const handleAdminRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestMessage('');
    setRequestError('');
    try {
      await requestAdminRole({ reason: adminRequestReason });
      setRequestMessage('Admin request submitted successfully!');
      setAdminRequestStatus('pending');
    } catch (err) {
      setRequestError(err.message || 'Failed to submit admin request.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        shippingAddress: {
          ...prevData.shippingAddress,
          [field]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateUserProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        My Account
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {user.profilePicture && (
            <Avatar
              src={user.profilePicture}
              sx={{ width: 80, height: 80, mr: 2 }}
            />
          )}
          <Box>
            <Typography variant='h5'>{user.displayName}</Typography>
            <Typography color='text.secondary'>{user.email}</Typography>
            <Typography variant='body2' color='text.secondary'>
              Role: {user.role}
            </Typography>
          </Box>
        </Box>

        <Typography variant='h6' gutterBottom>
          Update Profile
        </Typography>
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
        <Box component='form' onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Display Name'
                name='displayName'
                value={formData.displayName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
                Shipping Address
              </Typography>
            </Grid>
            {Object.keys(formData.shippingAddress).map((key) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField
                  fullWidth
                  label={
                    key.charAt(0).toUpperCase() +
                    key.slice(1).replace(/([A-Z])/g, ' $1')
                  }
                  name={`shippingAddress.${key}`}
                  value={formData.shippingAddress[key]}
                  onChange={handleChange}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button type='submit' variant='contained'>
                Save Profile
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant='h6' gutterBottom>
          Role Request Management
        </Typography>
        {requestMessage && (
          <Alert severity='success' sx={{ mb: 2 }}>
            {requestMessage}
          </Alert>
        )}
        {requestError && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {requestError}
          </Alert>
        )}

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Seller Role Request</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {user.role === 'seller' ? (
              <Typography>You are already a seller.</Typography>
            ) : sellerRequestStatus === 'pending' ? (
              <Typography>Your seller request is pending review.</Typography>
            ) : sellerRequestStatus === 'approved' ? (
              <Typography>Your seller request has been approved.</Typography>
            ) : (
              <Box component='form' onSubmit={handleSellerRequestSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Phone Number'
                      name='phoneNumber'
                      value={sellerRequestForm.phoneNumber}
                      onChange={handleSellerRequestFormChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label='Address'
                      name='address'
                      value={sellerRequestForm.address}
                      onChange={handleSellerRequestFormChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>Desired Categories</Typography>
                    <FormGroup>
                      {[
                        'Electronics',
                        'Audio',
                        'Computers',
                        'Accessories',
                        'Gaming',
                        'Home Appliances',
                        'Smart Home',
                      ].map((cat) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={cat}
                              checked={sellerRequestForm.desiredCategories.includes(
                                cat
                              )}
                              onChange={handleSellerCategoriesChange}
                            />
                          }
                          label={cat}
                          key={cat}
                        />
                      ))}
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Button type='submit' variant='contained'>
                      Request Seller Role
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Admin Role Request</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {user.role === 'admin' ? (
              <Typography>You are already an admin.</Typography>
            ) : adminRequestStatus === 'pending' ? (
              <Typography>Your admin request is pending review.</Typography>
            ) : adminRequestStatus === 'approved' ? (
              <Typography>Your admin request has been approved.</Typography>
            ) : (
              <Box component='form' onSubmit={handleAdminRequestSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label='Reason for Admin Role'
                      value={adminRequestReason}
                      onChange={(e) => setAdminRequestReason(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type='submit' variant='contained'>
                      Request Admin Role
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant='h6' gutterBottom>
          Order History
        </Typography>
        {ordersLoading ? (
          <CircularProgress />
        ) : orders.length === 0 ? (
          <Typography>No orders found.</Typography>
        ) : (
          orders.map((order) => (
            <Accordion key={order._id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  Order ID: {order._id} - Status: {order.status}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </Typography>
                <Typography>Total: ${order.totalAmount.toFixed(2)}</Typography>
                <List>
                  {order.items.map((item) => (
                    <ListItem key={item._id}>
                      <ListItemAvatar>
                        <Avatar
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          variant='square'
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.product.name}
                        secondary={`Quantity: ${item.quantity} - Price: $${item.price.toFixed(2)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default AccountPage;
