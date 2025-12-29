import { render, screen } from '@testing-library/react';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { WishlistProvider } from './context/WishlistContext';
import { ComparisonProvider } from './context/ComparisonContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import * as api from './services/api'; // Import all exports from api

// Mock the api module
jest.mock('./services/api');

const renderWithProviders = (ui) => {
  return render(
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <WishlistProvider>
            <ComparisonProvider>
              <CartProvider>
                {ui}
                <Notification />
              </CartProvider>
            </ComparisonProvider>
          </WishlistProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

test('renders the homepage with the main heading', async () => {
  // Provide mock implementations for the API calls
  api.fetchProducts.mockResolvedValue([]);
  api.fetchCart.mockResolvedValue([]);
  api.fetchWishlist.mockResolvedValue([]);
  api.getCurrentUser.mockResolvedValue(null);

  renderWithProviders(<App />);

  const headingElement = await screen.findByRole('heading', {
    name: /Discover Tomorrow's Tech, Today./i,
  });
  expect(headingElement).toBeInTheDocument();
});
