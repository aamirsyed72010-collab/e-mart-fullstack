import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from 'components/ProductCard';
import LoadingSpinner from 'components/LoadingSpinner';
import FilterSidebar from 'components/FilterSidebar';
import { motion, useScroll, useTransform } from 'framer-motion';
import { fetchProducts } from 'services/api';
import { allTags, allCategories } from 'constants/productConstants';
import { Container, Grid, Box, Typography, Button, Paper } from '@mui/material';

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

  const { scrollYProgress } = useScroll();

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        sx={{
          position: 'relative',
          p: 4,
          my: 4,
          textAlign: 'center',
          overflow: 'hidden',
          borderRadius: 4,
        }}
      >
        <Box
          component={motion.div}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            background: 'radial-gradient(circle at center, rgba(0,247,255,0.2) 0%, transparent 60%)',
            y: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Discover Tomorrow's Tech, Today.
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Explore cutting-edge electronics, smart devices, and gaming gear.
          </Typography>
          <Button variant="contained" size="large" sx={{ mt: 2 }}>
            Shop Now
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={3}>
          <FilterSidebar filters={filters} setFilters={setFilters} allTags={allTags} allCategories={allCategories} />
        </Grid>
        <Grid item xs={12} lg={9}>
          <main>
            {loading && <LoadingSpinner />}
            {error && <Typography color="error" align="center">Error: {error}</Typography>}
            {!loading && !error && (
              <motion.div
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
              >
                <Grid container spacing={3}>
                  {products.length > 0 ? (
                    products.map(product => (
                      <Grid item key={product._id} xs={12} sm={6} md={4}>
                        <ProductCard product={product} itemVariants={itemVariants} />
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography align="center">No products found matching your criteria.</Typography>
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