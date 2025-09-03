import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiShoppingCart, FiLogOut, FiTool, FiSun, FiMoon, FiSettings, FiHeart, FiColumns } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { useTheme } from '../context/ThemeContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import LoadingSpinner from './LoadingSpinner';

const Header = () => {
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { wishlistCount } = useWishlist();
  const { comparisonCount } = useComparison();
  const { user, loading, login, logout } = useAuth(); // Use auth context
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
      setSearchQuery('');
    }
  };

  const renderAuthContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    } else if (user) {
      return (
        <div className="flex items-center space-x-4">
          {user.role === 'seller' && (
            <Link to="/seller/dashboard" title="Seller Dashboard" className="text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
              <FiTool size={24} />
            </Link>
          )}
          {user.role === 'admin' && (
            <div className="relative flex items-center">
              <button onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)} title="Admin Settings" className="text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
                <FiSettings size={24} />
              </button>
              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface dark:bg-dark_surface rounded-md shadow-lg py-1 z-20">
                  <Link to="/admin/seller-requests" className="block px-4 py-2 text-sm text-text-default dark:text-dark_text-default hover:bg-gray-100 dark:hover:bg-dark_surface/50">Seller Requests</Link>
                  <Link to="/admin/users" className="block px-4 py-2 text-sm text-text-default dark:text-dark_text-default hover:bg-gray-100 dark:hover:bg-dark_surface/50">Manage Users</Link>
                  <Link to="/admin/products" className="block px-4 py-2 text-sm text-text-default dark:text-dark_text-default hover:bg-gray-100 dark:hover:bg-dark_surface/50">Manage Products</Link>
                  <Link to="/admin/reviews" className="block px-4 py-2 text-sm text-text-default dark:text-dark_text-default hover:bg-gray-100 dark:hover:bg-dark_surface/50">Manage Reviews</Link>
                  <Link to="/admin/admin-requests" className="block px-4 py-2 text-sm text-text-default dark:text-dark_text-default hover:bg-gray-100 dark:hover:bg-dark_surface/50">Manage Admin Requests</Link>
                </div>
              )}
            </div>
          )}
          <Link to="/account" title="My Account" className="text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
            <FiUser size={24} />
          </Link>
          {user.profilePicture && (
            <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full border border-primary dark:border-dark_primary" />
          )}
          <span className="text-text-default text-sm hidden md:block dark:text-dark_text-default">{user.displayName}</span>
          <button onClick={handleLogout} title="Logout" className="text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
            <FiLogOut size={24} />
          </button>
        </div>
      );
    } else {
      return (
        <button onClick={login} title="Sign In with Google" className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition-colors flex items-center space-x-2
                                       dark:bg-dark_primary dark:hover:bg-dark_primary-dark">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google Logo" className="w-4 h-4" />
          <span>Sign In with Google</span>
        </button>
      );
    }
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md shadow-xl shadow-blue-100 sticky top-0 z-10 border-b border-gray-200
                   dark:bg-dark_surface/80 dark:shadow-dark_primary/20 dark:border-dark_surface/50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-3xl font-bold text-text-light hover:text-primary transition-colors duration-300 flex-shrink-0
                           dark:text-dark_text-light dark:hover:text-dark_primary">
          Customize
        </Link>
        
        {/* Search Bar */}
        <div className="flex-grow mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md mx-auto">
            <input 
              type="text" 
              placeholder="Search for products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/70 border border-primary rounded-xl py-2 px-4 pl-10 text-text-default focus:outline-none focus:ring-2 focus:ring-primary shadow-lg shadow-blue-100
                     dark:bg-dark_surface/70 dark:border-dark_primary dark:text-dark_text-default dark:focus:ring-dark_primary dark:shadow-dark_primary/10"
            />
            <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary hover:text-primary-light transition-colors duration-300
                                       dark:text-dark_primary dark:hover:text-dark_primary-light">
              <FiSearch />
            </button>
          </form>
        </div>

        {/* Auth & Cart Icons */}
        <div className="flex items-center space-x-6 flex-shrink-0">
          {/* Theme Toggle */}
          <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} className="text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
            {theme === 'dark' ? <FiSun size={24} /> : <FiMoon size={24} />}
          </button>

          {renderAuthContent()}
          <Link to="/compare" title="Compare Products" className="relative text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
            <FiColumns size={24} />
            {comparisonCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center
                           dark:bg-dark_secondary">
                {comparisonCount}
              </span>
            )}
          </Link>
          <Link to="/wishlist" title="My Wishlist" className="relative text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
            <FiHeart size={24} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center
                           dark:bg-dark_secondary">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" title="My Cart" className="relative text-primary hover:text-primary-dark transition-colors dark:text-dark_primary dark:hover:text-dark_primary-dark">
            <FiShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse
                           dark:bg-dark_secondary">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
