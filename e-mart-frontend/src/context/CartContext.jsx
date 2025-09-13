import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  fetchCart as apiFetchCart,
  addToCart as apiAddToCart,
  updateCartItemQuantity as apiUpdateCartItemQuantity,
  removeCartItem as apiRemoveCartItem,
} from '../services/api';

export const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCart = async () => {
    try {
      const data = await apiFetchCart();
      setCartItems(data);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    setLoading(true);
    try {
      await apiAddToCart(productId, quantity);
      await getCart(); // Refetch cart to ensure consistency
      return true;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setLoading(false);
      return false;
    }
  };

  const updateCartItemQuantity = async (productId, newQuantity) => {
    setLoading(true);
    try {
      await apiUpdateCartItemQuantity(productId, newQuantity);
      await getCart(); // Refetch cart
      return true;
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      setLoading(false);
      return false;
    }
  };

  const removeCartItem = async (productId) => {
    setLoading(true);
    try {
      await apiRemoveCartItem(productId);
      await getCart(); // Refetch cart
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
