import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  fetchWishlist as apiFetchWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
} from '../services/api';
import { useAuth } from './AuthContext'; // Import useAuth

export const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth(); // Get the user
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchWishlist();
      setWishlistItems(data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setError(err.message);
      setWishlistItems([]); // Clear wishlist on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getWishlist();
    } else {
      // If no user, clear the wishlist and stop loading
      setWishlistItems([]);
      setLoading(false);
    }
  }, [user]); // Depend on the user object

  const addToWishlist = async (productId) => {
    if (!user) return false;
    try {
      await apiAddToWishlist(productId);
      await getWishlist();
      return true;
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      setError(err.message);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return false;
    try {
      await apiRemoveFromWishlist(productId);
      await getWishlist();
      return true;
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError(err.message);
      return false;
    }
  };

  const isProductInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item.product && item.product._id === productId
    );
  };

  const value = {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
    wishlistCount: wishlistItems.length,
    fetchWishlist: getWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
