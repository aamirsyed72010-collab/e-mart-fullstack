import React, { useState, useEffect, useCallback } from 'react';
import { useComparison } from '../../context/ComparisonContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchProductsForComparison } from '../../services/api';
import { Link } from 'react-router-dom';

const ComparisonPage = () => {
  const { comparisonList, removeFromCompare, clearCompareList } = useComparison();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProductsForComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (comparisonList.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchProductsForComparison(comparisonList);
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [comparisonList]);

  useEffect(() => {
    loadProductsForComparison();
  }, [loadProductsForComparison]);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Product Comparison</h1>
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

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Product Comparison</h1>
        <div className="bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
                    dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
          <p className="text-xl text-text-default mb-6 dark:text-dark_text-default">No products selected for comparison.</p>
          <Link
            to="/"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors duration-300
                       dark:bg-dark_primary dark:hover:bg-dark_primary-dark">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Extract all unique attributes from the products for comparison table headers
  const allAttributes = Array.from(new Set(products.flatMap(product => Object.keys(product))));
  // Filter out attributes that are not useful for comparison or are objects/arrays
  const comparableAttributes = allAttributes.filter(attr => 
    !['_id', '__v', 'seller', 'reviews', 'createdAt', 'updatedAt', 'views', 'sales'].includes(attr) &&
    typeof products[0][attr] !== 'object'
  ).sort(); // Sort alphabetically for consistent display

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">Product Comparison</h1>
      
      <div className="mb-4 flex justify-end space-x-2">
        {products.length > 0 && (
          <button
            onClick={clearCompareList}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="overflow-x-auto bg-surface/70 backdrop-blur-md rounded-xl p-6 shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark_surface/50">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider dark:text-dark_text-dark">Attribute</th>
              {products.map(product => (
                <th key={product._id} className="px-6 py-3 text-left text-xs font-medium text-text-dark uppercase tracking-wider dark:text-dark_text-dark">
                  <div className="flex flex-col items-center">
                    <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover rounded-lg mb-2" />
                    <Link to={`/product/${product._id}`} className="text-sm font-bold text-primary hover:underline dark:text-dark_primary">{product.name}</Link>
                    <button
                      onClick={() => removeFromCompare(product._id)}
                      className="text-red-500 hover:text-red-700 text-xs mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-gray-200 dark:bg-dark_surface dark:divide-dark_surface/50">
            {comparableAttributes.map(attr => (
              <tr key={attr}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-light dark:text-dark_text-light">{attr.charAt(0).toUpperCase() + attr.slice(1).replace(/([A-Z])/g, ' $1').trim()}</td>
                {products.map(product => (
                  <td key={product._id} className="px-6 py-4 whitespace-nowrap text-sm text-text-default dark:text-dark_text-default">
                    {attr === 'price' ? `$${product[attr].toFixed(2)}` : (Array.isArray(product[attr]) ? product[attr].join(', ') : product[attr])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonPage;
