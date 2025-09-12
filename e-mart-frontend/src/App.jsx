import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Box } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import Homepage from './pages/public/Homepage';
import ProductPage from './pages/public/ProductPage';
import CartPage from './pages/public/CartPage';
import SearchPage from './pages/public/SearchPage';
import AccountPage from './pages/public/AccountPage';
import WishlistPage from './pages/public/WishlistPage';
import ComparisonPage from './pages/public/ComparisonPage';
import CheckoutPage from './pages/public/CheckoutPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import InventoryManagementPage from './pages/seller/InventoryManagementPage';
import AdminSellerRequestsPage from './pages/admin/AdminSellerRequestsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAdminRequestsPage from './pages/admin/AdminAdminRequestsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/compare" element={<ComparisonPage />} />

            {/* Protected Routes */}
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/seller/dashboard" element={<ProtectedRoute sellerOnly={true}><SellerDashboardPage /></ProtectedRoute>} />
            <Route path="/seller/inventory" element={<ProtectedRoute sellerOnly={true}><InventoryManagementPage /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/seller-requests" element={<ProtectedRoute adminOnly={true}><AdminSellerRequestsPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly={true}><AdminProductsPage /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute adminOnly={true}><AdminReviewsPage /></ProtectedRoute>} />
            <Route path="/admin/admin-requests" element={<ProtectedRoute adminOnly={true}><AdminAdminRequestsPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
