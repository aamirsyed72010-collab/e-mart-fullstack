import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from 'components/ProductCard';
import ProductCardSkeleton from 'components/ProductCardSkeleton';
import FilterSidebar from 'components/FilterSidebar';
import { motion } from 'framer-motion';
import { fetchProducts } from 'services/api';
import { allTags, allCategories } from 'constants/productConstants';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    tags: [],
    category: '',
    price_min: '',
    price_max: '',
  });
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const primaryColor = isDarkMode ? '#8ab4f8' : '#1a73e8';
  const secondaryColor = isDarkMode ? '#fdd663' : '#ff6f00';
  const bgColor = isDarkMode ? '#20212400' : '#f8f9fa00';

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts(filters);
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        sx={{
          position: 'relative',
          p: 4,
          my: 4,
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          component={motion.div}
          animate={{
            background: [
              `radial-gradient(circle at 30% 30%, ${primaryColor}20, ${bgColor})`,
              `radial-gradient(circle at 70% 70%, ${secondaryColor}20, ${bgColor})`,
              `radial-gradient(circle at 30% 30%, ${primaryColor}20, ${bgColor})`,
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            right: '-50%',
            bottom: '-50%',
            width: '200%',
            height: '200%',
            zIndex: 0,
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant='h2'
            component='h1'
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Discover Tomorrow's Tech, Today.
          </Typography>
          <Typography variant='h5' color='text.secondary' paragraph>
            Explore cutting-edge electronics, smart devices, and gaming gear.
          </Typography>
          <Button variant='contained' size='large' sx={{ mt: 2 }}>
            Shop Now
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid xs={12} lg={3}>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            allTags={allTags}
            allCategories={allCategories}
          />
        </Grid>
        <Grid xs={12} lg={9}>
          <main>
            {loading ? (
              <Grid container spacing={3}>
                {Array.from(new Array(6)).map((item, index) => (
                  <Grid key={index} xs={12} sm={6} md={4}>
                    <ProductCardSkeleton />
                  </Grid>
                ))}
              </Grid>
            ) : error ? (
              <Typography color='error' align='center'>
                Error: {error}
              </Typography>
            ) : (
              <motion.div
                variants={sectionVariants}
                initial='hidden'
                animate='visible'
              >
                <Grid container spacing={3}>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <Grid key={product._id} xs={12} sm={6} md={4}>
                        <ProductCard
                          product={product}
                          itemVariants={itemVariants}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Grid xs={12}>
                      <Typography align='center'>
                        No products found matching your criteria.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </motion.div>
            )}
          </main>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Homepage;