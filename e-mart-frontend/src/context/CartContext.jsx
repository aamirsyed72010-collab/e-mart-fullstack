import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  fetchCart as apiFetchCart,
  addToCart as apiAddToCart,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  removeCartItem as apiRemoveCartItem,
} from '../services/api';
import { useAuth } from './AuthContext'; // Import useAuth

export const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth(); // Get the user
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemAdded, setItemAdded] = useState(false);

  const getCart = async () => {
    try {
      const data = await apiFetchCart();
      setCartItems(data);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      setCartItems([]); // Clear cart on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      getCart();
    } else {
      // If no user, clear the cart and stop loading
      setCartItems([]);
      setLoading(false);
    }
  }, [user]); // Depend on the user object

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return false; // Prevent action if not logged in
    setLoading(true);
    try {
      await apiAddToCart(productId, quantity);
      await getCart();
      setItemAdded(true);
      setTimeout(() => setItemAdded(false), 1000);
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setLoading(false);
      return false;
    }
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    if (!user) return false;
    setLoading(true);
    try {
      await apiUpdateCartItemQuantity(productId, newQuantity);
      await getCart();
      return true;
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      setLoading(false);
      return false;
    }
  };

  const removeCartItem = async (productId) => {
    if (!user) return false;
    setLoading(true);
    try {
      await apiRemoveCartItem(productId);
      await getCart();
      return true;
    } catch (error) {
      console.error('Failed to remove cart item:', error);
      setLoading(false);
      return false;
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    cartCount: cartItems.reduce((count, item) => count + item.quantity, 0),
    loading,
    itemAdded,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
