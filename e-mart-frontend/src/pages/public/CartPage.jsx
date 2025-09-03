import React from 'react';
import { useCart } from 'context/CartContext';
import { Link } from 'react-router-dom';
import LoadingSpinner from 'components/LoadingSpinner';

const CartPage = () => {
  const { cartItems, loading, updateCartItemQuantity, removeCartItem } = useCart(); // Destructure new functions

  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleQuantityChange = async (productId, newQuantity) => {
    await updateCartItemQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeCartItem(productId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Your Shopping Cart</h1>
        <LoadingSpinner />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Your Shopping Cart</h1>
        <div className="bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
                    dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
          <p className="text-xl text-text-default mb-6 dark:text-dark_text-default">Your cart is currently empty.</p>
          <Link
            to="/" 
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300
                       dark:bg-dark_primary dark:hover:bg-dark_primary-dark">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Your Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Cart Items List */}
        <div className="lg:col-span-2 bg-surface/70 backdrop-blur-md rounded-xl p-6 shadow-xl shadow-blue-100 border border-gray-200
                    dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
          {cartItems.map(item => (
            <div key={item.product._id} className="flex items-center justify-between border-b border-gray-200 py-4 last:border-b-0 dark:border-dark_surface/50">
              <div className="flex items-center">
                <img src={item.product.imageUrl} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg mr-4" />
                <div>
                  <h2 className="text-lg font-semibold text-text-light dark:text-dark_text-light">{item.product.name}</h2>
                  <p className="text-text-default dark:text-dark_text-default">Price: ${item.product.price.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-right text-text-default dark:text-dark_text-default flex flex-col items-end"> {/* Added flex-col and items-end */}
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-l-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.product._id, parseInt(e.target.value))}
                    className="w-12 text-center border-t border-b border-gray-200 dark:border-dark_surface/50 bg-surface/50 dark:bg-dark_surface/50 text-text-default dark:text-dark_text-default"
                    min="1"
                  />
                  <button
                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-r-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>
                <p className="font-semibold mb-2">Total: ${(item.product.price * item.quantity).toFixed(2)}</p>
                <button
                  onClick={() => handleRemoveItem(item.product._id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-surface/70 backdrop-blur-md rounded-xl p-6 h-fit shadow-xl shadow-blue-100 border border-gray-200
                    dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
          <h2 className="text-2xl font-bold border-b border-gray-200 pb-4 mb-4 text-text-light dark:text-dark_text-light">Order Summary</h2>
          <div className="flex justify-between mb-2 text-text-default dark:text-dark_text-default">
            <p>Subtotal</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mb-4 text-text-default dark:text-dark_text-default">
            <p>Shipping</p>
            <p>FREE</p>
          </div>
          <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-4 text-text-light dark:text-dark_text-light">
            <p>Total</p>
            <p>${total.toFixed(2)}</p>
          </div>
          <Link to="/checkout" className="mt-6 w-full bg-secondary text-white py-3 rounded-lg text-center hover:bg-secondary-dark transition-colors duration-300
                       dark:bg-dark_secondary dark:hover:bg-dark_secondary-dark">
            Proceed to Checkout
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CartPage;