import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiTrash2 } from 'react-icons/fi';
import { fetchAdminUsers, updateUserRole, deleteUser } from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setMessage('User role updated successfully.');
      fetchUsers(); // Refresh user list
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      try {
        await deleteUser(userId);
        setMessage('User deleted successfully.');
        fetchUsers(); // Refresh user list
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-text-light dark:text-dark_text-light">User Management</h1>
      <div className="max-w-4xl mx-auto bg-surface/70 backdrop-blur-md p-8 rounded-xl shadow-xl shadow-blue-100 border border-gray-200
                  dark:bg-dark_surface/70 dark:border-dark_surface/50 dark:shadow-dark_primary/10">
        {message && <div className="bg-primary/20 border border-primary text-primary-dark px-4 py-3 rounded relative mb-4">{message}</div>}
        {error && <div className="bg-secondary/20 border border-secondary text-secondary-dark px-4 py-3 rounded relative mb-4">{error}</div>}
        
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b dark:border-dark_surface/50">
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text-light">User</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Email</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Role</th>
                  <th className="text-left p-4 font-semibold text-text-light dark:text-dark_text_light">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b dark:border-dark_surface/50">
                    <td className="p-4 flex items-center">
                      <img src={user.profilePicture} alt={user.displayName} className="w-10 h-10 rounded-full mr-4" />
                      {user.displayName}
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">
                      <select value={user.role} onChange={(e) => handleRoleChange(user._id, e.target.value)} className="p-2 rounded-lg bg-surface/50 dark:bg-dark_surface/50 border border-gray-200 dark:border-dark_surface/50">
                        <option value="user">User</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(user._id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={20} /></button>
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

export default AdminUsersPage;
