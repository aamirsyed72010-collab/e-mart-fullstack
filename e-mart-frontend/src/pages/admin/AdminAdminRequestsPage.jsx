import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchAdminRequests as apiFetchAdminRequests, manageAdminRequest } from '../../services/api';
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

const AdminAdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState('');
  const [message, setMessage] = useState('');

  const fetchAdminRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const data = await apiFetchAdminRequests();
      setRequests(data);
    } catch (err) {
      setErrorRequests(err.message);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminRequests();
  }, [fetchAdminRequests]);

  const handleManageRequest = async (requestId, action) => {
    setMessage('');
    setErrorRequests('');
    try {
      const data = await manageAdminRequest(requestId, action);
      setMessage(data.msg);
      fetchAdminRequests();
    } catch (err) {
      setErrorRequests(err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Manage Admin Requests
      </Typography>
      <Paper sx={{ p: 3 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {errorRequests && <Alert severity="error" sx={{ mb: 2 }}>{errorRequests}</Alert>}
        
        {loadingRequests ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <Typography>No pending admin requests.</Typography>
        ) : (
          requests.map(request => (
            <Accordion key={request._id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{request.user.displayName} ({request.user.email})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">Reason: {request.reason}</Typography>
                <Typography variant="caption">Requested: {new Date(request.requestedAt).toLocaleDateString()}</Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="success" onClick={() => handleManageRequest(request._id, 'approved')}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={() => handleManageRequest(request._id, 'denied')}>
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

export default AdminAdminRequestsPage;
