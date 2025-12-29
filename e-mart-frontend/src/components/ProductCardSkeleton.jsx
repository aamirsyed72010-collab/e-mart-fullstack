import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';

const ProductCardSkeleton = () => {
  return (
    <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
      <Skeleton variant='rectangular' height={200} animation="wave" />
      <CardContent sx={{ p: 2 }}>
        <Skeleton variant='text' sx={{ fontSize: '1.5rem', mb: 1 }} width="80%" animation="wave" />
        <Skeleton variant='text' width='40%' height={30} animation="wave" />
      </CardContent>
      <CardContent sx={{ p: 2, pt: 0 }}>
        <Skeleton variant='rectangular' height={40} sx={{ borderRadius: 2, mb: 1 }} animation="wave" />
        <Skeleton variant='rectangular' height={40} sx={{ borderRadius: 2 }} animation="wave" />
      </CardContent>
    </Card>
  );
};

export default ProductCardSkeleton;
