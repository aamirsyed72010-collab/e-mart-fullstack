import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiTrash2 } from 'react-icons/fi';
import { fetchAdminProducts, deleteAdminReview } from '../../services/api';

const AdminReviewsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchProductsWithReviews = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProducts();
      // Filter for products that have reviews
      setProducts(data.filter(p => p.reviews && p.reviews.length > 0));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsWithReviews();
  }, [fetchProductsWithReviews]);

  const handleDelete = async (productId, reviewId) => {
    if (window.confirm('Are you sure you want to permanently delete this review?')) {
      try {
        await deleteAdminReview(productId, reviewId);
        setMessage('Review deleted successfully.');
        fetchProductsWithReviews(); // Refresh list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-text-light dark:text-dark_text-light">Review Management</h1>
      <div className="max-w-4xl mx-auto bg-surface/70 backdrop-blur-md p-8 rounded-xl shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        {message && <div className="bg-primary/20 border border-primary text-primary-dark px-4 py-3 rounded relative mb-4">{message}</div>}
        {error && <div className="bg-secondary/20 border border-secondary text-secondary-dark px-4 py-3 rounded relative mb-4">{error}</div>}
        
        {loading ? <LoadingSpinner /> : (
          <div className="space-y-8">
            {products.length === 0 ? (
              <p className="text-center text-text-default dark:text-dark_text-default">No reviews found.</p>
            ) : (
              products.map(product => (
                <div key={product._id}>
                  <h2 className="text-xl font-bold mb-2 text-text-light dark:text-dark_text-light">{product.name}</h2>
                  <div className="space-y-4">
                    {product.reviews.map(review => (
                      <div key={review._id} className="flex items-start justify-between bg-surface/50 p-4 rounded-lg border border-gray-200 dark:bg-dark_surface/50 dark:border-dark_surface/50">
                        <div>
                          <p className="font-semibold">{review.user} <span className="font-normal text-sm">- Rating: {review.rating}/5</span></p>
                          <p className="text-text-default dark:text-dark_text-default mt-1">{review.comment}</p>
                          <p className="text-xs text-text-dark mt-2">{new Date(review.createdAt).toLocaleString()}</p>
                        </div>
                        <button onClick={() => handleDelete(product._id, review._id)} className="text-red-500 hover:text-red-700 flex-shrink-0 ml-4"><FiTrash2 size={20} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsPage;
