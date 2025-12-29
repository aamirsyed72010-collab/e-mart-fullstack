const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

router.use((req, res, next) => {
  req.db = req.app.get('db');
  req.ensureAuthenticated = req.app.get('ensureAuthenticated');
  next();
});

// @route   GET api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', (req, res, next) => req.ensureAuthenticated(req, res, next), async (req, res) => {
  try {
    const userId = req.user.uid;
    const wishlistSnapshot = await req.db.collection('wishlist').where('userId', '==', userId).get();

    if (wishlistSnapshot.empty) {
      return res.json([]);
    }

    // Manual population of product data
    const productPromises = wishlistSnapshot.docs.map(doc => {
      const productId = doc.data().productId;
      return req.db.collection('products').doc(productId).get();
    });

    const productSnapshots = await Promise.all(productPromises);

    const items = wishlistSnapshot.docs.map((doc, i) => {
      const productDoc = productSnapshots[i];
      if (productDoc.exists) {
        return {
          _id: doc.id, // Wishlist item ID
          product: { _id: productDoc.id, ...productDoc.data() }
        };
      }
      return null;
    }).filter(item => item !== null);

    res.json(items);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/wishlist/add
// @desc    Add a product to wishlist
// @access  Private
router.post('/add',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [check('productId', 'Product ID is not valid').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId } = req.body;
    const userId = req.user.uid;

    try {
      // Check if already in wishlist
      const existingItemQuery = await req.db.collection('wishlist')
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .limit(1)
        .get();

      if (!existingItemQuery.empty) {
        return res.status(400).json({ msg: 'Product already in wishlist' });
      }

      const newItem = {
        userId,
        productId,
        createdAt: new Date(),
      };

      const docRef = await req.db.collection('wishlist').add(newItem);
      res.status(201).json({ id: docRef.id, ...newItem });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

// @route   DELETE api/wishlist/remove/:productId
// @desc    Remove a product from wishlist
// @access  Private
router.delete('/remove/:productId',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [check('productId', 'Product ID is not valid').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId } = req.params;
    const userId = req.user.uid;

    try {
      const querySnapshot = await req.db.collection('wishlist')
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        return res.status(404).json({ msg: 'Item not found in wishlist' });
      }

      const doc = querySnapshot.docs[0];
      await doc.ref.delete();
      res.json({ msg: 'Item removed from wishlist' });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;