import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { Snackbar, Alert } from '@mui/material';

const Notification = () => {
  const { notification, hideNotification } = useNotification();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    hideNotification();
  };

  if (!notification) return null;

  return (
    <Snackbar 
      key={notification.key}
      open={!!notification} 
      autoHideDuration={3000} 
      onClose={handleClose} 
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={notification.type || 'info'} sx={{ width: '100%' }} variant="filled">
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;