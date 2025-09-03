import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  fetchWishlist as apiFetchWishlist,
  addToWishlist as apiAddToWishlist,
  removeFromWishlist as apiRemoveFromWishlist
} from '../services/api';

export const WishlistContext = createContext();

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  const getWishlist = async () => {
    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const data = await apiFetchWishlist();
      setWishlistItems(data);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      setError(err.message); // Set error message
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWishlist();
  }, []);

  const addToWishlist = async (productId) => {
    try {
      await apiAddToWishlist(productId);
      await getWishlist(); // Refetch to update state
      return true;
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      setError(err.message); // Set error message
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await apiRemoveFromWishlist(productId);
      await getWishlist(); // Refetch to update state
      return true;
    } catch (err) {
      console.error('Failed to remove from wishlist:', err);
      setError(err.message); // Set error message
      return false;
    }
  };

  const isProductInWishlist = (productId) => {
    return wishlistItems.some(item => item.product && item.product._id === productId);
  };

  const value = {
    wishlistItems, // Provide full items
    loading,
    error, // Expose error state
    addToWishlist,
    removeFromWishlist,
    isProductInWishlist,
    wishlistCount: wishlistItems.length,
    fetchWishlist: getWishlist, // Expose refetch function
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
