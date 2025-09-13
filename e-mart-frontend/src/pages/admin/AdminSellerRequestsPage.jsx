import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  fetchSellerRequests as apiFetchSellerRequests,
  manageSellerRequest,
} from '../../services/api';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AdminSellerRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState('');
  const [message, setMessage] = useState('');

  const fetchSellerRequests = useCallback(async () => {
    setLoadingRequests(true);
    setErrorRequests('');
    try {
      const data = await apiFetchSellerRequests();
      setRequests(data);
    } catch (err) {
      setErrorRequests(err.message);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchSellerRequests();
  }, [fetchSellerRequests]);

  const handleManageRequest = async (requestId, action) => {
    setMessage('');
    setErrorRequests('');
    try {
      const data = await manageSellerRequest(requestId, action);
      setMessage(data.msg);
      fetchSellerRequests();
    } catch (err) {
      setErrorRequests(err.message);
    }
  };

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom align='center'>
        Admin Dashboard
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant='h5' gutterBottom>
          Pending Seller Requests
        </Typography>
        {message && (
          <Alert severity='success' sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        {errorRequests && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {errorRequests}
          </Alert>
        )}

        {loadingRequests ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <Typography>No pending seller requests.</Typography>
        ) : (
          requests.map((request) => (
            <Accordion key={request._id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  {request.user.displayName} ({request.user.email})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant='body2'>
                  Phone: {request.phoneNumber}
                </Typography>
                <Typography variant='body2'>
                  Address: {request.address}
                </Typography>
                <Typography variant='body2'>
                  Categories: {request.desiredCategories.join(', ')}
                </Typography>
                <Typography variant='caption'>
                  Requested:{' '}
                  {new Date(request.requestedAt).toLocaleDateString()}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant='contained'
                    color='success'
                    onClick={() => handleManageRequest(request._id, 'approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant='contained'
                    color='error'
                    onClick={() => handleManageRequest(request._id, 'denied')}
                  >
                    Deny
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Paper>
    </Container>
  );
};

export default AdminSellerRequestsPage;
