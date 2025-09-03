const API_BASE_URL = process.env.REACT_APP_API_BASE_URL.replace('/api', ''); // Remove /api from base URL

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ msg: 'Network response was not ok' }));
    throw new Error(errorData.msg || 'An unknown error occurred');
  }
  // For 204 No Content, response.json() will fail, so we return a success indicator.
  if (response.status === 204) {
    return { success: true };
  }
  return response.json();
};

const apiRequest = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: 'include', // Include cookies in all requests
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return handleResponse(response);
};

// AUTH
export const getCurrentUser = () => apiRequest('/api/current_user'); // Add /api prefix
export const googleCallback = (idToken) => apiRequest('/auth/google/callback', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${idToken}` }
});
export const logout = () => apiRequest('/api/logout'); // Add /api prefix


// PRODUCTS
export const fetchProducts = (filters) => {
  const params = new URLSearchParams();
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.category) params.append('category', filters.category);
  if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
  if (filters.price_min) params.append('price_min', filters.price_min);
  if (filters.price_max) params.append('price_max', filters.price_max);
  return apiRequest(`/api/products?${params.toString()}`); // Add /api prefix
};

export const fetchSearchResults = (filters) => {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.category) params.append('category', filters.category);
  if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
  if (filters.price_min) params.append('price_min', filters.price_min);
  if (filters.price_max) params.append('price_max', filters.price_max);
  return apiRequest(`/api/products/search?${params.toString()}`); // Add /api prefix
};
export const fetchProductById = (id) => apiRequest(`/api/products/${id}`); // Add /api prefix
export const fetchRecommendations = (productId) => apiRequest(`/api/products/recommendations/${productId}`); // Add /api prefix

export const fetchProductsForComparison = (productIds) => {
  const idsString = productIds.join(',');
  return apiRequest(`/api/products/compare?ids=${idsString}`);
};

export const submitReview = (productId, rating, comment) => apiRequest(`/api/products/${productId}/reviews`, {
  method: 'POST',
  body: JSON.stringify({ rating, comment }),
});


// SELLER
export const fetchSellerProducts = () => apiRequest('/api/products/seller/my-products'); // Add /api prefix
export const fetchAnalytics = () => apiRequest('/api/products/seller/analytics'); // Add /api prefix
export const addProduct = (productData) => apiRequest('/api/products', { method: 'POST', body: JSON.stringify(productData) }); // Add /api prefix
export const updateProduct = (productId, productData) => apiRequest(`/api/products/${productId}`, { method: 'PUT', body: JSON.stringify(productData) }); // Add /api prefix
export const deleteProduct = (productId) => apiRequest(`/api/products/${productId}`, { method: 'DELETE' }); // Add /api prefix


// CART
export const fetchCart = () => apiRequest('/api/cart'); // Add /api prefix
export const addToCart = (productId, quantity = 1) => apiRequest('/api/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) }); // Add /api prefix
export const updateCartItemQuantity = (productId, quantity) => apiRequest(`/api/cart/update/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }); // Add /api prefix
export const removeCartItem = (productId) => apiRequest(`/api/cart/remove/${productId}`, { method: 'DELETE' }); // Add /api prefix


// WISHLIST
export const fetchWishlist = () => apiRequest('/api/wishlist'); // Add /api prefix
export const addToWishlist = (productId) => apiRequest('/api/wishlist/add', { method: 'POST', body: JSON.stringify({ productId }) }); // Add /api prefix
export const removeFromWishlist = (productId) => apiRequest(`/api/wishlist/remove/${productId}`, { method: 'DELETE' }); // Add /api prefix


// ORDERS
export const placeOrder = (shippingAddress) => apiRequest('/api/orders', { method: 'POST', body: JSON.stringify({ shippingAddress }) }); // Add /api prefix

export const fetchOrders = () => apiRequest('/api/orders/my');

export const fetchSellerOrders = () => apiRequest('/api/orders/seller/my-orders');
export const updateSellerOrderStatus = (orderId, status) => apiRequest(`/api/orders/seller/update-status/${orderId}`, {
  method: 'PUT',
  body: JSON.stringify({ status }),
});


// USER
export const updateUserProfile = (profileData) => apiRequest('/api/users/profile', {
  method: 'PUT',
  body: JSON.stringify(profileData),
});
export const fetchSellerRequestStatus = () => apiRequest('/api/users/seller-request-status');
export const fetchAdminRequestStatus = () => apiRequest('/api/users/admin-request-status');
export const requestSellerRole = (requestData) => apiRequest('/api/users/request-seller-role', {
  method: 'POST',
  body: JSON.stringify(requestData),
});
export const requestAdminRole = (requestData) => apiRequest('/api/users/request-admin-role', {
  method: 'POST',
  body: JSON.stringify(requestData),
});

// Q&A
export const fetchQandA = (productId) => apiRequest(`/api/qanda/${productId}`);
export const askQuestion = (productId, question) => apiRequest(`/api/qanda/ask/${productId}`, {
  method: 'POST',
  body: JSON.stringify({ question }),
});
export const answerQuestion = (questionId, answer) => apiRequest(`/api/qanda/answer/${questionId}`, {
  method: 'POST',
  body: JSON.stringify({ answer }),
});

// ADMIN
export const fetchAdminRequests = () => apiRequest('/api/admin/admin-requests'); // Add /api prefix
export const manageAdminRequest = (requestId, action) => apiRequest(`/api/admin/manage-admin-request/${requestId}`, { method: 'POST', body: JSON.stringify({ action }) }); // Add /api prefix
export const fetchAdminProducts = () => apiRequest('/api/admin/products'); // Add /api prefix
export const deleteAdminProduct = (productId) => apiRequest(`/api/admin/products/${productId}`, { method: 'DELETE' }); // Add /api prefix
export const deleteAdminReview = (productId, reviewId) => apiRequest(`/api/admin/reviews/${productId}/${reviewId}`, { method: 'DELETE' }); // Add /api prefix
export const fetchSellerRequests = () => apiRequest('/api/admin/seller-requests'); // Add /api prefix
export const manageSellerRequest = (requestId, action) => apiRequest(`/api/admin/manage-seller-request/${requestId}`, { method: 'POST', body: JSON.stringify({ action }) }); // Add /api prefix
export const fetchAdminUsers = () => apiRequest('/api/admin/users'); // Add /api prefix
export const updateUserRole = (userId, role) => apiRequest(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }); // Add /api prefix
export const deleteUser = (userId) => apiRequest(`/api/admin/users/${userId}`, { method: 'DELETE' }); // Add /api prefix