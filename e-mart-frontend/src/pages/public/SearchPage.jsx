import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from 'components/ProductCard';
import LoadingSpinner from 'components/LoadingSpinner';
import FilterSidebar from 'components/FilterSidebar';
import { fetchSearchResults } from 'services/api';
import { allTags, allCategories } from 'constants/productConstants';

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
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Search Results for "{filters.q}"</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterSidebar filters={filters} setFilters={setFilters} allTags={allTags} allCategories={allCategories} />
        </div>
        <main className="lg:col-span-3">
          {loading && <LoadingSpinner />}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <>
              {products.length === 0 ? (
                <p className="text-center text-text-default dark:text-dark_text-default">No products found matching your search.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
