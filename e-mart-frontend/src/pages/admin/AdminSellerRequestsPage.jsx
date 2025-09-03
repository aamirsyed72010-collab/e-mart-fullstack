import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { fetchSellerRequests as apiFetchSellerRequests, manageSellerRequest } from '../../services/api';

const AdminSellerRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState('');
  const [message, setMessage] = useState('');

  const fetchSellerRequests = useCallback(async () => {
    setLoadingRequests(true);
    setErrorRequests('');
    try {
      const data = await apiFetchSellerRequests();
      setRequests(data);
    } catch (err) {
      setErrorRequests(err.message);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchSellerRequests();
  }, [fetchSellerRequests]);

  const handleManageRequest = async (requestId, action) => {
    setMessage('');
    setErrorRequests('');
    try {
      const data = await manageSellerRequest(requestId, action);
      setMessage(data.msg);
      fetchSellerRequests(); // Re-fetch requests to update list
    } catch (err) {
      setErrorRequests(err.message);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-text-light dark:text-dark_text-light">Admin Dashboard</h1>
      <div className="max-w-3xl mx-auto bg-surface/70 backdrop-blur-md p-8 rounded-xl shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-dark_text-light">Pending Seller Requests</h2>
        {message && <div className="bg-primary/20 border border-primary text-primary-dark px-4 py-3 rounded relative mb-4 dark:bg-dark_primary/20 dark:border-dark_primary dark:text-dark_primary-dark">{message}</div>}
        {errorRequests && <div className="bg-secondary/20 border border-secondary text-secondary-dark px-4 py-3 rounded relative mb-4 dark:bg-dark_secondary/20 dark:border-dark_secondary dark:text-dark_secondary-dark">{errorRequests}</div>}

        {loadingRequests ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <p className="text-text-default dark:text-dark_text-default">No pending seller requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request._id} className="bg-surface/50 p-4 rounded-lg border border-gray-200 flex justify-between items-center dark:bg-dark_surface/50 dark:border-dark_surface/50">
                <div>
                  <p className="font-semibold text-text-light dark:text-dark_text-light">{request.user.displayName} ({request.user.email})</p>
                  <p className="text-sm text-text-default dark:text-dark_text_default">Phone: {request.phoneNumber}</p>
                  <p className="text-sm text-text-default dark:text-dark_text_default">Address: {request.address}</p>
                  <p className="text-sm text-text-default dark:text-dark_text_default">Categories: {request.desiredCategories.join(', ')}</p>
                  <p className="text-xs text-text-dark dark:text-dark_text_dark">Requested: {new Date(request.requestedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleManageRequest(request._id, 'approved')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm transition-colors dark:bg-dark_primary dark:hover:bg-dark_primary-dark">
                    Approve
                  </button>
                  <button onClick={() => handleManageRequest(request._id, 'denied')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors dark:bg-dark_secondary dark:hover:bg-dark_secondary-dark">
                    Deny
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSellerRequestsPage;