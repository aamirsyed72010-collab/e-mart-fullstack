import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchSellerProducts, updateProductStock } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const InventoryManagementPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const [stockLevels, setStockLevels] = useState({});

  const loadSellerProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSellerProducts();
      setProducts(data);
      const initialStock = {};
      data.forEach(p => {
        initialStock[p._id] = p.stock;
      });
      setStockLevels(initialStock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSellerProducts();
  }, [loadSellerProducts]);

  const handleStockChange = (productId, value) => {
    setStockLevels(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleUpdateStock = async (productId) => {
    const newStock = stockLevels[productId];
    if (newStock === '' || isNaN(newStock) || newStock < 0) {
      showNotification('Please enter a valid stock number.', 'error');
      return;
    }

    try {
      await updateProductStock(productId, parseInt(newStock, 10));
      showNotification('Stock updated successfully!', 'success');
      loadSellerProducts();
    } catch (err) {
      showNotification(err.message || 'Failed to update stock.', 'error');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-text-light dark:text-dark_text-light">Inventory Management</h1>
      <div className="max-w-4xl mx-auto bg-surface/70 backdrop-blur-md p-8 rounded-xl shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        {error && <div className="bg-secondary/20 border border-secondary text-secondary-dark px-4 py-3 rounded relative mb-4">{error}</div>}
        
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-dark_surface/50">
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text-light">Product</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Current Stock</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Update Stock</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id} className="border-b dark:border-dark_surface/50">
                    <td className="p-4 flex items-center">
                      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                      {product.name}
                    </td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <input 
                        type="number"
                        value={stockLevels[product._id] || ''}
                        onChange={(e) => handleStockChange(product._id, e.target.value)}
                        className="shadow appearance-none border rounded w-24 py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
                                   dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
                      />
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleUpdateStock(product._id)}
                        className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300
                                   dark:bg-dark_primary dark:hover:bg-dark_primary-dark"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagementPage;
