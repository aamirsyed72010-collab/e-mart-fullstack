import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiTrash2 } from 'react-icons/fi';
import { fetchAdminProducts, deleteAdminProduct } from '../../services/api';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to permanently delete this product?')) {
      try {
        await deleteAdminProduct(productId);
        setMessage('Product deleted successfully.');
        fetchProducts(); // Refresh product list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-text-light dark:text-dark_text-light">Product Management</h1>
      <div className="max-w-6xl mx-auto bg-surface/70 backdrop-blur-md p-8 rounded-xl shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        {message && <div className="bg-primary/20 border border-primary text-primary-dark px-4 py-3 rounded relative mb-4">{message}</div>}
        {error && <div className="bg-secondary/20 border border-secondary text-secondary-dark px-4 py-3 rounded relative mb-4">{error}</div>}
        
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-dark_surface/50">
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text-light">Product</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Seller</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Price</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Stock</th>
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
                    <td className="p-4">{product.seller?.displayName || 'N/A'}</td>
                    <td className="p-4">${product.price.toFixed(2)}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(product._id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={20} /></button>
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

export default AdminProductsPage;
