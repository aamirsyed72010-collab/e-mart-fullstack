import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from 'components/LoadingSpinner';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import SellerAnalytics from 'components/SellerAnalytics';
import { allTags, allCategories } from 'constants/productConstants';
import { fetchSellerProducts, fetchAnalytics, addProduct, updateProduct, deleteProduct } from 'services/api';
import { Link } from 'react-router-dom';

const SellerDashboardPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stock: '',
    tags: [],
    category: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadSellerProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const data = await fetchSellerProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch seller products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    loadSellerProducts();
    loadAnalytics();
  }, [loadSellerProducts, loadAnalytics]);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    const formState = isModalOpen ? setEditingProduct : setFormData;
    const currentData = isModalOpen ? editingProduct : formData;

    if (name === 'tags') {
      formState((prevData) => {
        const newTags = checked
          ? [...prevData.tags, value]
          : prevData.tags.filter((tag) => tag !== value);
        return { ...prevData, tags: newTags };
      });
    } else {
      formState({ ...currentData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!formData.name || !formData.description || !formData.price || !formData.imageUrl || !formData.stock || !formData.category || formData.tags.length === 0) {
      setError('Please fill in all product fields, including category, stock and at least one tag.');
      return;
    }

    try {
      const data = await addProduct(formData);
      setMessage(`Product "${data.name}" added successfully!`);
      setFormData({ name: '', description: '', price: '', imageUrl: '', stock: '', tags: [], category: '' });
      loadSellerProducts();
      loadAnalytics();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await updateProduct(editingProduct._id, editingProduct);
      setMessage('Product updated successfully!');
      setIsModalOpen(false);
      setEditingProduct(null);
      loadSellerProducts();
      loadAnalytics();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setMessage('Product deleted successfully.');
        loadSellerProducts();
        loadAnalytics();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-text-light dark:text-dark_text-light">Seller Dashboard</h1>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-dark_text-light">Your Analytics</h2>
        {loadingAnalytics ? <LoadingSpinner /> : <SellerAnalytics analytics={analytics} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface/70 backdrop-blur-md p-8 rounded-xl shadow-xl shadow-blue-100 border border-gray-200
                    dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
          <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-dark_text-light">Add a New Product</h2>
          {message && <div className="bg-primary/20 border border-primary text-primary-dark px-4 py-3 rounded relative mb-4">{message}</div>}
          {error && <div className="bg-secondary/20 border border-secondary text-secondary-dark px-4 py-3 rounded relative mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Product Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
                       dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} required
                className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline h-24 focus:ring-2 focus:ring-primary
                               dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
              ></textarea>
            </div>
            <div>
              <label htmlFor="price" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text-default">Price</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01"
                className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
                               dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text_default">Stock Quantity</label>
              <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required
                className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
                               dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
              />
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text_default">Image URL</label>
              <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required
                className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
                               dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text_default">Category</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} required
                className="shadow appearance-none border border-gray-200 rounded w-full py-2 px-3 bg-surface/50 text-text-default leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-primary
                               dark:bg-dark_surface/50 dark:border-dark_surface/50 dark:text-dark_text-default dark:focus:ring-dark_primary"
              >
                <option value="">Select a category</option>
                {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-text-default text-sm font-bold mb-2 dark:text-dark_text_default">Tags</label>
              <div className="grid grid-cols-2 gap-2">
                {allTags.map(tag => (
                  <label key={tag} className="inline-flex items-center text-text-default dark:text-dark_text_default">
                    <input
                      type="checkbox"
                      name="tags"
                      value={tag}
                      checked={formData.tags.includes(tag)}
                      onChange={handleChange}
                      className="form-checkbox h-5 w-5 text-primary dark:text-dark_primary"
                    />
                    <span className="ml-2">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit"
              className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors duration-300 w-full
                             dark:bg-dark_primary dark:hover:bg-dark_primary-dark"
            >
              Add Product
            </button>
          </form>
        </div>

        <div className="bg-surface/70 backdrop-blur-md p-8 rounded-xl shadow-xl shadow-blue-100 border border-gray-200
                    dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
          <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-dark_text-light">Your Products</h2>
          {loadingProducts ? <LoadingSpinner /> : (
            <div className="space-y-4">
              {products.map(p => (
                <div key={p._id} className="flex items-center justify-between bg-surface/50 p-4 rounded-lg border border-gray-200 dark:bg-dark_surface/50 dark:border-dark_surface/50">
                  <div className="flex items-center">
                    <img src={p.imageUrl} alt={p.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                    <div>
                      <p className="font-semibold text-text-light dark:text-dark_text-light">{p.name}</p>
                      <p className="text-sm text-text-default dark:text-dark_text-default">Stock: {p.stock}</p>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <button onClick={() => openEditModal(p)} className="text-blue-500 hover:text-blue-700"><FiEdit size={20} /></button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-surface dark:bg-dark_surface p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label htmlFor="name-edit" className="block text-sm font-bold mb-2">Product Name</label>
                <input type="text" id="name-edit" name="name" value={editingProduct.name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="description-edit" className="block text-sm font-bold mb-2">Description</label>
                <textarea id="description-edit" name="description" value={editingProduct.description} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline h-24"></textarea>
              </div>
              <div>
                <label htmlFor="price-edit" className="block text-sm font-bold mb-2">Price</label>
                <input type="number" id="price-edit" name="price" value={editingProduct.price} onChange={handleChange} required step="0.01" className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="stock-edit" className="block text-sm font-bold mb-2">Stock Quantity</label>
                <input type="number" id="stock-edit" name="stock" value={editingProduct.stock} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="imageUrl-edit" className="block text-sm font-bold mb-2">Image URL</label>
                <input type="url" id="imageUrl-edit" name="imageUrl" value={editingProduct.imageUrl} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline" />
              </div>
              <div>
                <label htmlFor="category-edit" className="block text-sm font-bold mb-2">Category</label>
                <select id="category-edit" name="category" value={editingProduct.category} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline">
                  <option value="">Select a category</option>
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Tags</label>
                <div className="grid grid-cols-3 gap-2">
                  {allTags.map(tag => (
                    <label key={tag} className="inline-flex items-center">
                      <input type="checkbox" name="tags" value={tag} checked={editingProduct.tags.includes(tag)} onChange={handleChange} className="form-checkbox h-5 w-5" />
                      <span className="ml-2">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mr-2">Cancel</button>
                <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboardPage;