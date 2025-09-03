import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, itemVariants }) => {
  const { addToCart } = useCart();
  const { addToCompare, removeFromCompare, isProductInCompare } = useComparison();
  const [isAdded, setIsAdded] = useState(false);

  const handleCompareToggle = () => {
    if (isProductInCompare(product._id)) {
      removeFromCompare(product._id);
    } else {
      addToCompare(product._id);
    }
  };

  const handleAddToCart = async () => {
    if (isAdded) return;

    const success = await addToCart(product._id);
    if (success) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    } else {
      alert('Failed to add item. Please try again.');
    }
  };

  return (
    <motion.div
      className="relative border border-gray-200 rounded-xl p-3 shadow-lg bg-surface/50 backdrop-blur-md transform hover:-translate-y-2 hover:shadow-xl hover:scale-[1.02] transition-all duration-300
             dark:border-dark_surface/50 dark:bg-dark_surface/50 dark:shadow-2xl dark:shadow-dark_primary/20 dark:hover:shadow-dark_primary/40"
      variants={itemVariants}
    >
      {product.stock === 0 && (
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          Out of Stock
        </div>
      )}
      <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover mb-3 rounded-lg" />
      <div className="flex-grow text-text-default dark:text-dark_text-default">
        <h2 className="text-md font-semibold mb-1 text-text-light dark:text-dark_text-light">{product.name}</h2>
        <p className="text-sm text-text-dark dark:text-dark_text-dark">${product.price.toFixed(2)}</p>
      </div>
      <button 
        onClick={handleAddToCart}
        disabled={isAdded || product.stock === 0}
        className={`mt-3 w-full text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ${
          isAdded
            ? 'bg-secondary-dark cursor-not-allowed dark:bg-dark_secondary-dark'
            : 'bg-primary hover:bg-primary-dark dark:bg-dark_primary dark:hover:bg-dark_primary-dark'
        } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {product.stock === 0 ? 'Out of Stock' : (isAdded ? 'Added!' : 'Add to Cart')}
      </button>
      <button
        onClick={handleCompareToggle}
        className={`mt-2 w-full text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-300 ${
          isProductInCompare(product._id)
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isProductInCompare(product._id) ? 'In Comparison' : 'Compare'}
      </button>
      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{boxShadow: '0 0 15px rgba(0,247,255,0.3)'}}></div>
    </motion.div>
  );
};

export default ProductCard;
