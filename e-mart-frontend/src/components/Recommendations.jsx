import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import { fetchRecommendations as apiFetchRecommendations } from 'services/api';

const Recommendations = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const data = await apiFetchRecommendations(productId);
        setRecommendations(data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [productId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (recommendations.length === 0) {
    return null; // Don't render anything if there are no recommendations
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-dark_text-light">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommendations.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
