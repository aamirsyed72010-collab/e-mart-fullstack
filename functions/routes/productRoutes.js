const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

router.use((req, res, next) => {
  req.db = req.app.get('db');
  req.ensureAuthenticated = req.app.get('ensureAuthenticated');
  // A simple role checker middleware
  req.ensureRole = (role) => (req, res, next) => {
    if (req.firestoreUser && (req.firestoreUser.role === role || req.firestoreUser.role === 'admin')) {
      return next();
    }
    return res.status(403).json({ msg: `Forbidden: Requires ${role} role` });
  };
  next();
});

// @route   POST api/products
// @desc    Create a product
// @access  Private (Seller only)
router.post('/',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price must be a positive number').isFloat({ gt: 0 }),
    check('stock', 'Stock must be a non-negative integer').isInt({ min: 0 }),
    check('imageUrl', 'Image URL is required').isURL(),
    check('category', 'Category is required').not().isEmpty(),
    check('tags', 'Tags must be an array with at least one tag').isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, stock, imageUrl, category, tags, lowStockThreshold } = req.body;

    try {
      const newProduct = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl,
        category,
        tags,
        lowStockThreshold: lowStockThreshold ? Number(lowStockThreshold) : 5,
        seller: req.user.uid,
        status: 'active',
        views: 0,
        sales: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await req.db.collection('products').add(newProduct);
      res.json({ id: docRef.id, ...newProduct });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

// @route   GET api/products/seller/my-products
// @desc    Get all products for the logged-in seller
// @access  Private (Seller only)
router.get('/seller/my-products', 
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  async (req, res) => {
  try {
    let query = req.db.collection('products').where('seller', '==', req.user.uid);
    if (req.query.status && req.query.status !== 'all') {
      query = query.where('status', '==', req.query.status);
    }
    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/seller/analytics
// @desc    Get analytics for the logged-in seller
// @access  Private (Seller only)
router.get('/seller/analytics', 
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  async (req, res) => {
  try {
    const snapshot = await req.db.collection('products').where('seller', '==', req.user.uid).get();
    const products = snapshot.docs.map(doc => doc.data());

    if (products.length === 0) {
      return res.json({
        totalProducts: 0, 
        totalStock: 0, 
        totalViews: 0, 
        totalSales: 0, 
        lowStockProducts: [], 
        topViewed: [], 
        topSold: [] 
      });
    }

    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
    const totalViews = products.reduce((acc, p) => acc + p.views, 0);
    const totalSales = products.reduce((acc, p) => acc + p.sales, 0);
    const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 5));
    const topViewed = [...products].sort((a, b) => b.views - a.views).slice(0, 5);
    const topSold = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);

    res.json({
      totalProducts, 
      totalStock, 
      totalViews, 
      totalSales, 
      lowStockProducts, 
      topViewed, 
      topSold 
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products
// @desc    Get all products with filtering, sorting, and searching
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { q, category, tags, sortBy, price_min, price_max } = req.query;

    let query = req.db.collection('products').where('status', '==', 'active');

    if (category) {
      query = query.where('category', '==', category);
    }
    if (tags) {
      query = query.where('tags', 'array-contains-any', tags.split(','));
    }
    if (price_min) {
      query = query.where('price', '>=', Number(price_min));
    }
    if (price_max) {
      query = query.where('price', '<=', Number(price_max));
    }

        // Note: Firestore requires range filters and inequality filters 
    // to be on the same field as the first orderBy clause.
    switch (sortBy) {
      case 'price_asc':
        query = query.orderBy('price', 'asc');
        break;
      case 'price_desc':
        query = query.orderBy('price', 'desc');
        break;
      case 'newest':
      default:
        query = query.orderBy('createdAt', 'desc');
        break;
    }
    
        // Basic text search (starts-with). For full-text search, 
    // an external service like Algolia is recommended.
    if (q) {
        query = query.where('name', '>=', q).where('name', '<=', q + '\uf8ff');
    }

    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private (Seller only)
router.put('/:id',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  async (req, res) => {
    try {
      const docRef = req.db.collection('products').doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      if (doc.data().seller !== req.user.uid && req.firestoreUser.role !== 'admin') {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      const updateData = { ...req.body, updatedAt: new Date() };
      await docRef.update(updateData);

      res.json({ id: doc.id, ...updateData });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

// @route   DELETE api/products/:id (Archive)
// @desc    Archive a product
// @access  Private (Seller only)
router.delete('/:id',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  async (req, res) => {
    try {
      const docRef = req.db.collection('products').doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      if (doc.data().seller !== req.user.uid && req.firestoreUser.role !== 'admin') {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      await docRef.update({ status: 'archived', updatedAt: new Date() });
      res.json({ msg: 'Product archived' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

// @route   PUT api/products/seller/update-stock/:id
// @desc    Update stock for a product
// @access  Private (Seller only)
router.put('/seller/update-stock/:id',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  [check('stock', 'Stock must be a non-negative integer').isInt({ min: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { stock } = req.body;

    try {
      const docRef = req.db.collection('products').doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ msg: 'Product not found' });
      }

      if (doc.data().seller !== req.user.uid && req.firestoreUser.role !== 'admin') {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      await docRef.update({ stock: Number(stock), updatedAt: new Date() });
      res.json({ id: doc.id, ...doc.data(), stock: Number(stock) });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;