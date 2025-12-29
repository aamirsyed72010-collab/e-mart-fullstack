const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

router.use((req, res, next) => {
  req.db = req.app.get('db');
  req.ensureAuthenticated = req.app.get('ensureAuthenticated');
  req.ensureRole = (role) => (req, res, next) => {
    if (req.firestoreUser && (req.firestoreUser.role === role || req.firestoreUser.role === 'admin')) {
      return next();
    }
    return res.status(403).json({ msg: `Forbidden: Requires ${role} role` });
  };
  next();
});

// @route   POST /api/orders
// @desc    Place a new order from the cart
// @access  Private
router.post('/',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [
    check('shippingAddress.fullName', 'Full name is required').not().isEmpty(),
    // ... other validations
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { shippingAddress } = req.body;
    const userId = req.user.uid;

    try {
      const orderId = await req.db.runTransaction(async (transaction) => {
        const cartRef = req.db.collection('cart').where('userId', '==', userId);
        const cartSnapshot = await transaction.get(cartRef);

        if (cartSnapshot.empty) {
          throw new Error('Your cart is empty');
        }

        const orderItems = [];
        let totalAmount = 0;
        const sellerIds = new Set();

        // Read all products and check stock first
        const productReads = [];
        for (const cartDoc of cartSnapshot.docs) {
          const { productId, quantity } = cartDoc.data();
          const productRef = req.db.collection('products').doc(productId);
          productReads.push(
            transaction.get(productRef).then(productDoc => ({ productDoc, quantity, cartDocRef: cartDoc.ref }))
          );
        }
        const resolvedProducts = await Promise.all(productReads);

        for (const { productDoc, quantity } of resolvedProducts) {
          if (!productDoc.exists) {
            throw new Error(`Product with ID ${productDoc.id} not found.`);
          }
          const product = productDoc.data();
          if (product.stock < quantity) {
            throw new Error(`Not enough stock for ${product.name}. Only ${product.stock} available.`);
          }

          orderItems.push({
            productId: productDoc.id,
            name: product.name, // Denormalize for easier display
            imageUrl: product.imageUrl,
            price: product.price,
            quantity,
          });
          totalAmount += quantity * product.price;
          sellerIds.add(product.seller);
        }

        // All checks passed, now perform writes
        const newOrderRef = req.db.collection('orders').doc();
        transaction.set(newOrderRef, {
          userId,
          user: { displayName: req.firestoreUser.displayName, email: req.firestoreUser.email },
          items: orderItems,
          totalAmount,
          shippingAddress,
          sellerIds: Array.from(sellerIds),
          status: 'pending',
          createdAt: new Date(),
        });

        // Update product stock and sales, and delete cart items
        for (const { productDoc, quantity, cartDocRef } of resolvedProducts) {
          const newStock = productDoc.data().stock - quantity;
          const newSales = (productDoc.data().sales || 0) + quantity;
          transaction.update(productDoc.ref, { stock: newStock, sales: newSales });
          transaction.delete(cartDocRef);
        }
        
        return newOrderRef.id;
      });

      res.status(201).json({ msg: 'Order placed successfully', orderId });

    } catch (error) {
      console.error('Order transaction failed: ', error.message);
      res.status(500).json({ msg: error.message || 'Server Error' });
    }
  });

// @route   GET /api/orders/my
// @desc    Get all orders for the authenticated user
// @access  Private
router.get('/my', (req, res, next) => req.ensureAuthenticated(req, res, next), async (req, res) => {
  try {
    const ordersSnapshot = await req.db
      .collection('orders')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    const orders = ordersSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders/seller/my-orders
// @desc    Get all orders for products sold by the authenticated seller
// @access  Private (Seller only)
router.get('/seller/my-orders', 
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  async (req, res) => {
  try {
    const ordersSnapshot = await req.db.collection('orders')
      .where('sellerIds', 'array-contains', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = ordersSnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/orders/seller/update-status/:orderId
// @desc    Update the status of an order (for seller)
// @access  Private (Seller only)
router.put('/seller/update-status/:orderId',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  (req, res, next) => req.ensureRole('seller')(req, res, next),
  [check('orderId', 'Order ID is not valid').isString()],
  async (req, res) => {
    const { status } = req.body;

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid order status' });
    }

    try {
      const orderRef = req.db.collection('orders').doc(req.params.orderId);
      const orderDoc = await orderRef.get();

      if (!orderDoc.exists) {
        return res.status(404).json({ msg: 'Order not found' });
      }

      if (
        !orderDoc.data().sellerIds.includes(req.user.uid) && 
        req.firestoreUser.role !== 'admin'
      ) {
        return res.status(401).json({ msg: 'Not authorized to update this order.' });
      }

      await orderRef.update({ status });
      res.json({ ...orderDoc.data(), status });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;