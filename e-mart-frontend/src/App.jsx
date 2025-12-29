import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';

import Header from './components/Header';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';
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
import ManageOrdersPage from './pages/seller/ManageOrdersPage';
import AdminSellerRequestsPage from './pages/admin/AdminSellerRequestsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';
import AdminAdminRequestsPage from './pages/admin/AdminAdminRequestsPage';
import ProtectedRoute from './components/ProtectedRoute';

// We need a component to get the location, because useLocation can only be used in a child of <Router>
const AppContent = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Header />
      <main className='flex-grow'>
        <AnimatePresence mode='wait'>
          <Routes location={location} key={location.pathname}>
            <Route
              path='/'
              element={
                <PageTransition>
                  <Homepage />
                </PageTransition>
              }
            />
            <Route
              path='/product/:id'
              element={
                <PageTransition>
                  <ProductPage />
                </PageTransition>
              }
            />
            <Route
              path='/cart'
              element={
                <PageTransition>
                  <CartPage />
                </PageTransition>
              }
            />
            <Route
              path='/search'
              element={
                <PageTransition>
                  <SearchPage />
                </PageTransition>
              }
            />
            <Route
              path='/wishlist'
              element={
                <PageTransition>
                  <WishlistPage />
                </PageTransition>
              }
            />
            <Route
              path='/compare'
              element={
                <PageTransition>
                  <ComparisonPage />
                </PageTransition>
              }
            />

            {/* Protected Routes */}
            <Route
              path='/account'
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <AccountPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/checkout'
              element={
                <PageTransition>
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/seller/dashboard'
              element={
                <PageTransition>
                  <ProtectedRoute sellerOnly={true}>
                    <SellerDashboardPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/seller/inventory'
              element={
                <PageTransition>
                  <ProtectedRoute sellerOnly={true}>
                    <InventoryManagementPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/seller/orders'
              element={
                <PageTransition>
                  <ProtectedRoute sellerOnly={true}>
                    <ManageOrdersPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />

            {/* Admin Routes */}
            <Route
              path='/admin/seller-requests'
              element={
                <PageTransition>
                  <ProtectedRoute adminOnly={true}>
                    <AdminSellerRequestsPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/admin/users'
              element={
                <PageTransition>
                  <ProtectedRoute adminOnly={true}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/admin/products'
              element={
                <PageTransition>
                  <ProtectedRoute adminOnly={true}>
                    <AdminProductsPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/admin/reviews'
              element={
                <PageTransition>
                  <ProtectedRoute adminOnly={true}>
                    <AdminReviewsPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
            <Route
              path='/admin/admin-requests'
              element={
                <PageTransition>
                  <ProtectedRoute adminOnly={true}>
                    <AdminAdminRequestsPage />
                  </ProtectedRoute>
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </Box>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
