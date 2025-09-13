const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ msg: 'Network response was not ok' }));
    throw new Error(errorData.msg || 'An unknown error occurred');
  }
  if (response.status === 204) {
    return { success: true };
  }
  return response.json();
};

const apiRequest = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return handleResponse(response);
};

// AUTH
export const getCurrentUser = () => apiRequest('/api/current_user');
export const googleCallback = (idToken) =>
  apiRequest('/api/auth/google/callback', {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}` },
  });
export const logout = () => apiRequest('/api/logout');

// PRODUCTS
export const fetchProducts = (filters) => {
  const params = new URLSearchParams();
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.category) params.append('category', filters.category);
  if (filters.tags && filters.tags.length > 0)
    params.append('tags', filters.tags.join(','));
  if (filters.price_min) params.append('price_min', filters.price_min);
  if (filters.price_max) params.append('price_max', filters.price_max);
  return apiRequest(`/api/products?${params.toString()}`);
};

export const fetchSearchResults = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.category) params.append('category', filters.category);
  if (filters.tags && filters.tags.length > 0)
    params.append('tags', filters.tags.join(','));
  if (filters.price_min) params.append('price_min', filters.price_min);
  if (filters.price_max) params.append('price_max', filters.price_max);
  return apiRequest(`/api/products/search?${params.toString()}`);
};
export const fetchProductById = (id) => apiRequest(`/api/products/${id}`);
export const fetchRecommendations = (productId) =>
  apiRequest(`/api/products/recommendations/${productId}`);

export const fetchProductsForComparison = (productIds) => {
  const idsString = productIds.join(',');
  return apiRequest(`/api/products/compare?ids=${idsString}`);
};

export const submitReview = (productId, rating, comment) =>
  apiRequest(`/api/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });

// SELLER
export const fetchSellerProducts = () =>
  apiRequest('/api/products/seller/my-products');
export const fetchAnalytics = () =>
  apiRequest('/api/products/seller/analytics');
export const addProduct = (productData) =>
  apiRequest('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
export const updateProduct = (productId, productData) =>
  apiRequest(`/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
export const deleteProduct = (productId) =>
  apiRequest(`/api/products/${productId}`, { method: 'DELETE' });
export const updateProductStock = (productId, stock) =>
  apiRequest(`/api/products/seller/update-stock/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ stock }),
  });

// CART
export const fetchCart = () => apiRequest('/api/cart');
export const addToCart = (productId, quantity = 1) =>
  apiRequest('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
export const updateCartItemQuantity = (productId, quantity) =>
  apiRequest(`/api/cart/update/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
export const removeCartItem = (productId) =>
  apiRequest(`/api/cart/remove/${productId}`, { method: 'DELETE' });

// WISHLIST
export const fetchWishlist = () => apiRequest('/api/wishlist');
export const addToWishlist = (productId) =>
  apiRequest('/api/wishlist/add', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
export const removeFromWishlist = (productId) =>
  apiRequest(`/api/wishlist/remove/${productId}`, { method: 'DELETE' });

// ORDERS
export const placeOrder = (shippingAddress) =>
  apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ shippingAddress }),
  });

export const fetchOrders = () => apiRequest('/api/orders/my');

export const fetchSellerOrders = () =>
  apiRequest('/api/orders/seller/my-orders');
export const updateSellerOrderStatus = (orderId, status) =>
  apiRequest(`/api/orders/seller/update-status/${orderId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

// USER
export const updateUserProfile = (profileData) =>
  apiRequest('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
export const fetchSellerRequestStatus = () =>
  apiRequest('/api/users/seller-request-status');
export const fetchAdminRequestStatus = () =>
  apiRequest('/api/users/admin-request-status');
export const requestSellerRole = (requestData) =>
  apiRequest('/api/users/request-seller-role', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
export const requestAdminRole = (requestData) =>
  apiRequest('/api/users/request-admin-role', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });

// Q&A
export const fetchQandA = (productId) => apiRequest(`/api/qanda/${productId}`);
export const askQuestion = (productId, question) =>
  apiRequest(`/api/qanda/ask/${productId}`, {
    method: 'POST',
    body: JSON.stringify({ question }),
  });
export const answerQuestion = (questionId, answer) =>
  apiRequest(`/api/qanda/answer/${questionId}`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });

// ADMIN
export const fetchAdminRequests = () => apiRequest('/api/admin/admin-requests');
export const manageAdminRequest = (requestId, action) =>
  apiRequest(`/api/admin/manage-admin-request/${requestId}`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
export const fetchAdminProducts = () => apiRequest('/api/admin/products');
export const deleteAdminProduct = (productId) =>
  apiRequest(`/api/admin/products/${productId}`, { method: 'DELETE' });
export const deleteAdminReview = (productId, reviewId) =>
  apiRequest(`/api/admin/reviews/${productId}/${reviewId}`, {
    method: 'DELETE',
  });
export const fetchSellerRequests = () =>
  apiRequest('/api/admin/seller-requests');
export const manageSellerRequest = (requestId, action) =>
  apiRequest(`/api/admin/manage-seller-request/${requestId}`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
export const fetchAdminUsers = () => apiRequest('/api/admin/users');
export const updateUserRole = (userId, role) =>
  apiRequest(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
export const deleteUser = (userId) =>
  apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' });
