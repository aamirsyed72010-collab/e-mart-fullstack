import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from 'components/ProductCard';
import LoadingSpinner from 'components/LoadingSpinner';
import FilterSidebar from 'components/FilterSidebar';
import { fetchSearchResults } from 'services/api';
import { allTags, allCategories } from 'constants/productConstants';
import { Container, Grid, Typography } from '@mui/material';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    tags: searchParams.getAll('tags') || [],
    category: searchParams.get('category') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
  });

  const loadSearchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.category) params.append('category', filters.category);
    if (filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters.price_min) params.append('price_min', filters.price_min);
    if (filters.price_max) params.append('price_max', filters.price_max);

    setSearchParams(params); // Update URL

    try {
      const data = await fetchSearchResults(filters);
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters, setSearchParams]);

  useEffect(() => {
    loadSearchResults();
  }, [loadSearchResults]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        Search Results for "{filters.q}"
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={3}>
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            allTags={allTags}
            allCategories={allCategories}
          />
        </Grid>
        <Grid item xs={12} lg={9}>
          <main>
            {loading && <LoadingSpinner />}
            {error && (
              <Typography color='error' align='center'>
                Error: {error}
              </Typography>
            )}
            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <Typography align='center'>
                    No products found matching your search.
                  </Typography>
                ) : (
                  <Grid container spacing={3}>
                    {products.map((product) => (
                      <Grid item key={product._id} xs={12} sm={6} md={4}>
                        <ProductCard product={product} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </main>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchPage;
