import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { Box } from '@mui/material';

const ProtectedRoute = ({
  children,
  adminOnly = false,
  sellerOnly = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100vh',
        }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to='/' state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to='/' state={{ from: location }} replace />;
  }

  if (sellerOnly && user.role !== 'seller' && user.role !== 'admin') {
    return <Navigate to='/' state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
