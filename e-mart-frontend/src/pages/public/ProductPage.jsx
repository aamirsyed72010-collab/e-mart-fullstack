import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from 'components/LoadingSpinner';
import { fetchProductById } from 'services/api';
import { useCart } from 'context/CartContext';
import { useWishlist } from 'context/WishlistContext';
import { useAuth } from 'context/AuthContext';
import { submitReview } from 'services/api';
import { useNotification } from 'context/NotificationContext';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { showNotification } = useNotification();

  const { addToCart } = useCart();
  const { addToWishlist, isProductInWishlist } = useWishlist();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddedToWishlist, setIsAddedToWishlist] = useState(false);

  const handleAddToCart = async () => {
    if (isAddedToCart) return;
    const success = await addToCart(product._id);
    if (success) {
      setIsAddedToCart(true);
      setTimeout(() => setIsAddedToCart(false), 2000);
    } else {
      showNotification('Failed to add to cart. Please try again.', 'error');
    }
  };

  const handleAddToWishlist = async () => {
    if (isAddedToWishlist || isProductInWishlist(product._id)) return;
    const success = await addToWishlist(product._id);
    if (success) {
      setIsAddedToWishlist(true);
      setTimeout(() => setIsAddedToWishlist(false), 2000);
    } else {
      showNotification('Failed to add to wishlist. Please try again.', 'error');
    }
  };

  const { user } = useAuth(); // Get user from auth context

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewRating || !reviewComment) {
      showNotification('Please provide a rating and a comment.', 'error');
      return;
    }

    try {
      await submitReview(product._id, reviewRating, reviewComment);
      showNotification('Review submitted successfully!', 'success');
      setReviewRating(0);
      setReviewComment('');
      fetchProduct(); // Re-fetch product to show new review
    } catch (err) {
      showNotification(err.message || 'Failed to submit review.', 'error');
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-8 text-center text-text-default dark:text-dark_text-default">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
             dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10"
      >
        <div>
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-xl shadow-lg shadow-blue-100 dark:shadow-dark_primary/10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4 text-text-light dark:text-dark_text-light">{product.name}</h1>
          <p className="text-xl text-text-default mb-4 dark:text-dark_text-default">${product.price.toFixed(2)}</p>
          <p className="text-text-default mb-6 dark:text-dark_text-default">{product.description}</p>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleAddToCart}
              disabled={isAddedToCart || product.stock === 0}
              className={`flex-1 py-3 rounded-lg text-white font-semibold transition-colors ${
                product.stock === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isAddedToCart
                  ? 'bg-secondary-dark cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : (isAddedToCart ? 'Added to Cart!' : 'Add to Cart')}
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={isAddedToWishlist || isProductInWishlist(product._id)}
              className={`flex-1 py-3 rounded-lg text-white font-semibold transition-colors ${
                isAddedToWishlist || isProductInWishlist(product._id)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-accent hover:bg-accent-dark'
              }`}
            >
              {isAddedToWishlist || isProductInWishlist(product._id) ? 'In Wishlist!' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-12 bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
             dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        <h2 className="text-2xl font-bold mb-6 text-text-light dark:text-dark_text-light">Customer Reviews</h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0 dark:border-dark_surface/50">
                <div className="flex items-center mb-2">
                  {review.user && review.user.profilePicture && (
                    <img src={review.user.profilePicture} alt={review.user.displayName} className="w-8 h-8 rounded-full mr-2" />
                  )}
                  <p className="font-semibold text-text-default dark:text-dark_text-default">{review.user ? review.user.displayName : 'Anonymous'}</p>
                  <p className="ml-4 text-sm text-text-dark dark:text-dark_text-dark">Rating: {review.rating}/5</p>
                </div>
                <p className="text-text-default dark:text-dark_text-default">{review.comment}</p>
                <p className="text-xs text-text-dark mt-1 dark:text-dark_text-dark">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-default dark:text-dark_text-default">No reviews yet. Be the first to review this product!</p>
        )}

        {/* Review Submission Form */}
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 text-text-light dark:text-dark_text-light">Write a Review</h3>
          {user ? (
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Rating (1-5)</label>
                <input
                  type="number"
                  id="rating"
                  min="1"
                  max="5"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
                  required
                />
              </div>
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Comment</label>
                <textarea
                  id="comment"
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <p className="text-text-default dark:text-dark_text-default">Please <span className="text-primary cursor-pointer hover:underline" onClick={user.login}>log in</span> to write a review.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;