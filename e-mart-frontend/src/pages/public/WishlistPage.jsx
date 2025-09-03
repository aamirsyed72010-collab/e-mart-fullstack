import React from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from 'components/LoadingSpinner';
import ProductCard from 'components/ProductCard';
import { useWishlist } from 'context/WishlistContext';

const WishlistPage = () => {
  const { wishlistItems, loading, error } = useWishlist(); // Destructure error

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Your Wishlist</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) { // Display error if present
    return (
      <div className="container mx-auto px-6 py-8 text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Your Wishlist</h1>
      {wishlistItems.length === 0 ? (
        <div className="text-center bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl">
          <p className="text-xl text-text-default mb-6 dark:text-dark_text-default">Your wishlist is empty.</p>
          <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors">
            Find products you'll love
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map(item => (
            <ProductCard key={item.product._id} product={item.product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
