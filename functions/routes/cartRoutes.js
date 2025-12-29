const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

router.use((req, res, next) => {
  req.db = req.app.get('db');
  req.ensureAuthenticated = req.app.get('ensureAuthenticated');
  next();
});

// @route   POST api/cart/add
// @desc    Add an item to the cart
// @access  Private
router.post('/add',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [
    check('productId', 'Product ID is required').not().isEmpty(),
    check('quantity', 'Quantity must be a positive integer').isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, quantity } = req.body;
    const userId = req.user.uid;

    try {
      const cartRef = req.db.collection('cart');
      const querySnapshot = await cartRef
        .where('userId', '==', userId)
        .where('productId', '==', productId)
        .limit(1)
        .get();

      if (!querySnapshot.empty) {
        // Item exists, update quantity
        const doc = querySnapshot.docs[0];
        const newQuantity = doc.data().quantity + quantity;
        await doc.ref.update({ quantity: newQuantity });
        res.json({ ...doc.data(), quantity: newQuantity });
      } else {
        // Item does not exist, create new
        const newItem = {
          userId,
          productId,
          quantity,
        };
        const docRef = await cartRef.add(newItem);
        res.status(201).json({ id: docRef.id, ...newItem });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

// @route   GET api/cart
// @desc    Get all cart items for a user
// @access  Private
router.get('/', (req, res, next) => req.ensureAuthenticated(req, res, next), async (req, res) => {
  try {
    const userId = req.user.uid;
    const cartSnapshot = await req.db.collection('cart').where('userId', '==', userId).get();
    
    if (cartSnapshot.empty) {
        return res.json([]);
    }

    // Firestore doesn't have populate, so we fetch products manually
    const productPromises = cartSnapshot.docs.map(doc => {
        const productId = doc.data().productId;
        return req.db.collection('products').doc(productId).get();
    });

    const productSnapshots = await Promise.all(productPromises);

    const items = cartSnapshot.docs.map((doc, i) => {
        const productDoc = productSnapshots[i];
        if (productDoc.exists) {
            return {
                _id: doc.id, // Use cart item doc id
                quantity: doc.data().quantity,
                product: { _id: productDoc.id, ...productDoc.data() }
            };
        } 
        return null; // In case a product was deleted but still in cart
    }).filter(item => item !== null); // Filter out nulls

    res.json(items);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/cart/update/:productId
// @desc    Update quantity of an item in the cart
// @access  Private
router.put('/update/:productId',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [check('quantity', 'Quantity must be a non-negative integer').isInt({ min: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { quantity } = req.body;
    const { productId } = req.params;
    const userId = req.user.uid;

    try {
        const cartRef = req.db.collection('cart');
        const querySnapshot = await cartRef
            .where('userId', '==', userId)
            .where('productId', '==', productId)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return res.status(404).json({ msg: 'Cart item not found' });
        }

        const doc = querySnapshot.docs[0];

        if (quantity <= 0) {
            await doc.ref.delete();
            return res.json({ msg: 'Item removed from cart' });
        }

        await doc.ref.update({ quantity });
        res.json({ ...doc.data(), quantity });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
  });

// @route   DELETE api/cart/remove/:productId
// @desc    Remove an item from the cart
// @access  Private
router.delete('/remove/:productId',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  async (req, res) => {
    const { productId } = req.params;
    const userId = req.user.uid;

    try {
        const cartRef = req.db.collection('cart');
        const querySnapshot = await cartRef
            .where('userId', '==', userId)
            .where('productId', '==', productId)
            .limit(1)
            .get();

        if (querySnapshot.empty) {
            return res.status(404).json({ msg: 'Cart item not found' });
        }

        const doc = querySnapshot.docs[0];
        await doc.ref.delete();
        res.json({ msg: 'Item removed from cart' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
  });

module.exports = router;