import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from 'components/ProductCard';
import LoadingSpinner from 'components/LoadingSpinner';
import FilterSidebar from 'components/FilterSidebar';
import { motion, useScroll, useTransform } from 'framer-motion';
import { fetchProducts } from 'services/api';
import { allTags, allCategories } from 'constants/productConstants';

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
    <div className="container mx-auto px-6 py-8">
      <motion.div
        className="relative bg-surface/70 backdrop-blur-md rounded-2xl p-8 my-8 text-center shadow-2xl shadow-blue-100 border border-gray-200 overflow-hidden
             dark:bg-dark_surface/70 dark:text-dark_text-default dark:shadow-dark_primary/20 dark:border-dark_surface/50"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,247,255,0.2) 0%, transparent 60%)',
            y: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) // Background moves faster
          }}
        ></motion.div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-text-light drop-shadow-lg
                   dark:text-dark_text-light">
            Discover Tomorrow's Tech, Today.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-text-default max-w-2xl mx-auto
                  dark:text-dark_text-default">
            Explore cutting-edge electronics, smart devices, and gaming gear.
          </p>
          <button className="bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-100
                       dark:bg-dark_primary dark:hover:bg-dark_primary-dark dark:shadow-dark_primary/30">
            Shop Now
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterSidebar filters={filters} setFilters={setFilters} allTags={allTags} allCategories={allCategories} />
        </div>
        <main className="lg:col-span-3">
          {loading && <LoadingSpinner />}
          {error && <p className="text-center text-red-500">Error: {error}</p>}
          {!loading && !error && (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
            >
              {products.length > 0 ? (
                products.map(product => (
                  <ProductCard key={product._id} product={product} itemVariants={itemVariants} />
                ))
              ) : (
                <p className="text-center col-span-full text-text-default dark:text-dark_text-default">No products found matching your criteria.</p>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Homepage;
