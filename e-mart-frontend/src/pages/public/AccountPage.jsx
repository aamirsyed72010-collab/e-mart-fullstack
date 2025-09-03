import React, { useState, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import { updateUserProfile, fetchOrders, fetchSellerRequestStatus, fetchAdminRequestStatus, requestSellerRole, requestAdminRole } from 'services/api';

const AccountPage = () => {
  const { user, login } = useAuth(); // Get login function to refresh user data
  const [formData, setFormData] = useState({
    displayName: '',
    shippingAddress: {
      fullName: '',
      houseNo: '',
      streetName: '',
      address: '',
      city: '',
      district: '',
      taluk: '',
      postalCode: '',
      country: '',
    },
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const [sellerRequestStatus, setSellerRequestStatus] = useState('none');
  const [adminRequestStatus, setAdminRequestStatus] = useState('none');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');

  const [sellerRequestForm, setSellerRequestForm] = useState({
    phoneNumber: '',
    address: '',
    desiredCategories: [],
  });
  const [adminRequestReason, setAdminRequestReason] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        shippingAddress: {
          fullName: user.shippingAddress?.fullName || '',
          houseNo: user.shippingAddress?.houseNo || '',
          streetName: user.shippingAddress?.streetName || '',
          address: user.shippingAddress?.address || '',
          city: user.shippingAddress?.city || '',
          district: user.shippingAddress?.district || '',
          taluk: user.shippingAddress?.taluk || '',
          postalCode: user.shippingAddress?.postalCode || '',
          country: user.shippingAddress?.country || '',
        },
      });

      const getOrders = async () => {
        setOrdersLoading(true);
        try {
          const data = await fetchOrders();
          setOrders(data);
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        } finally {
          setOrdersLoading(false);
        }
      };
      getOrders();

      const getRequestStatuses = async () => {
        try {
          const sellerStatus = await fetchSellerRequestStatus();
          setSellerRequestStatus(sellerStatus.status);
          const adminStatus = await fetchAdminRequestStatus();
          setAdminRequestStatus(adminStatus.status);
        } catch (err) {
          console.error('Failed to fetch request statuses:', err);
        }
      };
      getRequestStatuses();
    }
  }, [user]);

  const handleSellerRequestFormChange = (e) => {
    const { name, value } = e.target;
    setSellerRequestForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSellerCategoriesChange = (e) => {
    const { value, checked } = e.target;
    setSellerRequestForm(prev => {
      const newCategories = checked
        ? [...prev.desiredCategories, value]
        : prev.desiredCategories.filter(cat => cat !== value);
      return { ...prev, desiredCategories: newCategories };
    });
  };

  const handleSellerRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestMessage('');
    setRequestError('');
    try {
      await requestSellerRole(sellerRequestForm);
      setRequestMessage('Seller request submitted successfully!');
      setSellerRequestStatus('pending'); // Update status immediately
    } catch (err) {
      setRequestError(err.message || 'Failed to submit seller request.');
    }
  };

  const handleAdminRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestMessage('');
    setRequestError('');
    try {
      await requestAdminRole({ reason: adminRequestReason });
      setRequestMessage('Admin request submitted successfully!');
      setAdminRequestStatus('pending'); // Update status immediately
    } catch (err) {
      setRequestError(err.message || 'Failed to submit admin request.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('shippingAddress.')) {
      const field = name.split('.')[1];
      setFormData((prevData) => ({
        ...prevData,
        shippingAddress: {
          ...prevData.shippingAddress,
          [field]: value,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateUserProfile(formData);
      // Manually update user in AuthContext if needed, or rely on re-fetch
      // For simplicity, we'll just show a message and assume context updates on next render/login
      setMessage('Profile updated successfully!');
      // A more robust solution would be to call a context update function here
      // e.g., updateAuthUser(updatedUser);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  // The ProtectedRoute component will handle loading and non-user cases
  if (!user) {
    return null; // Or a loading spinner if you prefer, but ProtectedRoute handles it
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-light dark:text-dark_text-light">My Account</h1>
      <div className="bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10 dark:text-dark_text-default">
        <div className="flex items-center mb-6">
          {user.profilePicture && (
            <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full border-4 border-primary mr-6 dark:border-dark_primary" />
          )}
          <div>
            <h2 className="text-2xl font-bold text-text-light dark:text-dark_text-light">{user.displayName}</h2>
            <p className="text-lg text-text-default dark:text-dark_text-default">{user.email}</p>
            <p className="text-sm text-text-dark dark:text-dark_text-dark">Role: {user.role}</p>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4 text-text-light dark:text-dark_text-light">Update Profile</h3>
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{message}</div>}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>

          <h4 className="text-lg font-bold mt-6 mb-2 text-text-light dark:text-dark_text-light">Shipping Address</h4>
          <div>
            <label htmlFor="shippingAddress.fullName" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Full Name</label>
            <input
              type="text"
              id="shippingAddress.fullName"
              name="shippingAddress.fullName"
              value={formData.shippingAddress.fullName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.houseNo" className="block text-sm font-medium text-text-default dark:text-dark_text-default">House No./Building Name</label>
            <input
              type="text"
              id="shippingAddress.houseNo"
              name="shippingAddress.houseNo"
              value={formData.shippingAddress.houseNo} 
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.streetName" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Street Name/Locality</label>
            <input
              type="text"
              id="shippingAddress.streetName"
              name="shippingAddress.streetName"
              value={formData.shippingAddress.streetName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.address" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Address Line (Optional)</label>
            <input
              type="text"
              id="shippingAddress.address"
              name="shippingAddress.address"
              value={formData.shippingAddress.address}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.city" className="block text-sm font-medium text-text-default dark:text-dark_text-default">City</label>
            <input
              type="text"
              id="shippingAddress.city"
              name="shippingAddress.city"
              value={formData.shippingAddress.city}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.district" className="block text-sm font-medium text-text-default dark:text-dark_text-default">District</label>
            <input
              type="text"
              id="shippingAddress.district"
              name="shippingAddress.district"
              value={formData.shippingAddress.district}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.taluk" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Taluk</label>
            <input
              type="text"
              id="shippingAddress.taluk"
              name="shippingAddress.taluk"
              value={formData.shippingAddress.taluk}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.postalCode" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Postal Code</label>
            <input
              type="text"
              id="shippingAddress.postalCode"
              name="shippingAddress.postalCode"
              value={formData.shippingAddress.postalCode}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <div>
            <label htmlFor="shippingAddress.country" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Country</label>
            <input
              type="text"
              id="shippingAddress.country"
              name="shippingAddress.country"
              value={formData.shippingAddress.country}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Role Request Management Section */}
      <div className="mt-12 bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10 dark:text-dark_text-default">
        <h3 className="text-xl font-bold mb-4 text-text-light dark:text-dark_text-light">Role Request Management</h3>
        {requestMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{requestMessage}</div>}
        {requestError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{requestError}</div>}

        {/* Seller Role Request */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-dark_surface/50">
          <h4 className="text-lg font-bold mb-2 text-text-light dark:text-dark_text-light">Seller Role Request</h4>
          {user && user.role === 'seller' ? (
            <p className="text-text-default dark:text-dark_text-default">You are already a seller.</p>
          ) : sellerRequestStatus === 'pending' ? (
            <p className="text-text-default dark:text-dark_text-default">Your seller request is pending review.</p>
          ) : sellerRequestStatus === 'approved' ? (
            <p className="text-text-default dark:text-dark_text-default">Your seller request has been approved.</p>
          ) : (
            <form onSubmit={handleSellerRequestSubmit} className="space-y-3">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={sellerRequestForm.phoneNumber}
                  onChange={handleSellerRequestFormChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
                  required
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows="2"
                  value={sellerRequestForm.address}
                  onChange={handleSellerRequestFormChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-default dark:text-dark_text-default">Desired Categories</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {['Electronics', 'Audio', 'Computers', 'Accessories', 'Gaming', 'Home Appliances', 'Smart Home'].map(cat => (
                    <label key={cat} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={cat}
                        checked={sellerRequestForm.desiredCategories.includes(cat)}
                        onChange={handleSellerCategoriesChange}
                        className="form-checkbox h-4 w-4 text-primary dark:text-dark_primary"
                      />
                      <span className="ml-2 text-sm text-text-default dark:text-dark_text-default">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
              >
                Request Seller Role
              </button>
            </form>
          )}
        </div>

        {/* Admin Role Request */}
        <div className="p-4 border border-gray-200 rounded-lg dark:border-dark_surface/50">
          <h4 className="text-lg font-bold mb-2 text-text-light dark:text-dark_text-light">Admin Role Request</h4>
          {user && user.role === 'admin' ? (
            <p className="text-text-default dark:text-dark_text-default">You are already an admin.</p>
          ) : adminRequestStatus === 'pending' ? (
            <p className="text-text-default dark:text-dark_text-default">Your admin request is pending review.</p>
          ) : adminRequestStatus === 'approved' ? (
            <p className="text-text-default dark:text-dark_text-default">Your admin request has been approved.</p>
          ) : (
            <form onSubmit={handleAdminRequestSubmit} className="space-y-3">
              <div>
                <label htmlFor="adminReason" className="block text-sm font-medium text-text-default dark:text-dark_text-default">Reason for Admin Role</label>
                <textarea
                  id="adminReason"
                  rows="3"
                  value={adminRequestReason}
                  onChange={(e) => setAdminRequestReason(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-dark_surface dark:border-dark_surface/50 dark:text-dark_text-default"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
              >
                Request Admin Role
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Order History Section */}
      <div className="mt-12 bg-surface/70 backdrop-blur-md rounded-xl p-8 shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10 dark:text-dark_text-default">
        <h3 className="text-xl font-bold mb-4 text-text-light dark:text-dark_text-light">Order History</h3>
        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="border-b border-gray-200 pb-4 last:border-b-0 dark:border-dark_surface/50">
                <p className="font-semibold text-text-light dark:text-dark_text-light">Order ID: {order._id}</p>
                <p className="text-sm text-text-default dark:text-dark_text-default">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-text-default dark:text-dark_text-default">Total: ${order.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-text-default dark:text-dark_text-default">Status: {order.status}</p>
                <div className="ml-4 mt-2 space-y-1">
                  <p className="font-medium text-text-default dark:text-dark_text-default">Items:</p>
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center text-sm text-text-default dark:text-dark_text-default">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 object-cover rounded-md mr-2" />
                      <span>{item.product.name} (x{item.quantity}) - ${item.price.toFixed(2)} each</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
