import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';
import {
  Inventory as InventoryIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  AllInbox as AllInboxIcon,
} from '@mui/icons-material';

const StatCard = ({ icon, title, value, color }) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      borderColor: color,
      borderWidth: 1,
      borderStyle: 'solid',
    }}
  >
    <Avatar sx={{ bgcolor: color, color: 'common.white' }}>{icon}</Avatar>
    <Box>
      <Typography color='text.secondary'>{title}</Typography>
      <Typography variant='h5' component='p' sx={{ fontWeight: 'bold' }}>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const ProductList = ({ title, products, field }) => (
  <Paper elevation={3} sx={{ p: 2 }}>
    <Typography variant='h6' gutterBottom>
      {title}
    </Typography>
    <List dense>
      {products.map((p) => (
        <ListItem key={p._id} disableGutters>
          <ListItemText primary={p.name} />
          <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
            {p[field]}
          </Typography>
        </ListItem>
      ))}
    </List>
  </Paper>
);

const SellerAnalytics = ({ analytics }) => {
  if (!analytics) return null;

  const {
    totalProducts,
    totalStock,
    totalViews,
    totalSales,
    topViewed,
    topSold,
  } = analytics;

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<AllInboxIcon />}
            title='Total Products'
            value={totalProducts}
            color='info.main'
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<InventoryIcon />}
            title='Total Stock'
            value={totalStock}
            color='success.main'
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<VisibilityIcon />}
            title='Total Views'
            value={totalViews}
            color='warning.main'
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon />}
            title='Total Sales'
            value={totalSales}
            color='error.main'
          />
        </Grid>
      </Grid>
      <Grid container spacing={3}>
        <Grid xs={12} md={6}>
          <ProductList
            title='Top 5 Most Viewed'
            products={topViewed}
            field='views'
          />
        </Grid>
        <Grid xs={12} md={6}>
          <ProductList
            title='Top 5 Best Selling'
            products={topSold}
            field='sales'
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerAnalytics;