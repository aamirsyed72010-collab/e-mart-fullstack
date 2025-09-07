const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const CartItem = require('../models/Cart'); // To clear cart after order
const Product = require('../models/Product'); // To get product details for order items
const {check, validationResult} = require('express-validator');
const {ensureAuthenticated, ensureRole} = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Place a new order from the cart
// @access  Private
router.post('/',
    ensureAuthenticated,
    [
      check('shippingAddress.fullName', 'Full name is required').not().isEmpty(),
      check('shippingAddress.houseNo', 'House number is required').not().isEmpty(),
      check('shippingAddress.streetName', 'Street name is required').not().isEmpty(),
      check('shippingAddress.city', 'City is required').not().isEmpty(),
      check('shippingAddress.district', 'District is required').not().isEmpty(),
      check('shippingAddress.taluk', 'Taluk is required').not().isEmpty(),
      check('shippingAddress.postalCode', 'Postal code is required').not().isEmpty(),
      check('shippingAddress.country', 'Country is required').not().isEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {shippingAddress} = req.body;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Get cart items for the user
        const cartItems = await CartItem.find({user: req.user.id}).session(session).populate('product');

        if (cartItems.length === 0) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({msg: 'Your cart is empty'});
        }

        // Check stock and prepare order items
        const orderItems = [];
        let totalAmount = 0;
        for (const item of cartItems) {
          const product = item.product;
          if (product.stock < item.quantity) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
              msg: `Not enough stock for ${product.name}. Only ${product.stock} available.`,
            });
          }
          orderItems.push({
            product: product._id,
            quantity: item.quantity,
            price: product.price,
          });
          totalAmount += item.quantity * product.price;
        }

        // Create new order
        const newOrder = new Order({
          user: req.user.id,
          items: orderItems,
          totalAmount,
          shippingAddress,
          status: 'pending', // Initial status
        });

        const order = await newOrder.save({session});

        // Decrement stock for each product in the order
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: {stock: -item.quantity, sales: item.quantity},
          }, {session});
        }

        // Clear the user's cart after successful order
        await CartItem.deleteMany({user: req.user.id}).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({msg: 'Order placed successfully', order});
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET /api/orders/my
// @desc    Get all orders for the authenticated user
// @access  Private
router.get('/my', ensureAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({user: req.user.id}).populate('items.product', 'name imageUrl price');
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/orders/seller/my-orders
// @desc    Get all orders for products sold by the authenticated seller
// @access  Private (Seller only)
router.get('/seller/my-orders', ensureAuthenticated, ensureRole('seller'), async (req, res) => {
  try {
    // Find products sold by this seller
    const sellerProducts = await Product.find({seller: req.user.id}).select('_id');
    const sellerProductIds = sellerProducts.map((product) => product._id);

    // Find orders that contain any of these products
    const orders = await Order.find({
      'items.product': {$in: sellerProductIds},
    })
        .populate('user', 'displayName email') // Populate user who placed the order
        .populate('items.product', 'name imageUrl price'); // Populate product details

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
    ensureAuthenticated,
    ensureRole('seller'),
    [check('orderId', 'Order ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {status} = req.body;

      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({msg: 'Invalid order status'});
      }

      try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
          return res.status(404).json({msg: 'Order not found'});
        }

        // Verify that this seller is responsible for at least one product in the order
        const sellerProducts = await Product.find({seller: req.user.id}).select('_id');
        const sellerProductIds = sellerProducts.map((product) => product._id.toString());

        const isSellerResponsible = order.items.some((item) => sellerProductIds.includes(item.product.toString()));

        if (!isSellerResponsible && req.user.role !== 'admin') { // Admin can update any order
          return res.status(401).json({msg: 'Not authorized to update this order.'});
        }

        order.status = status;
        await order.save();

        res.json(order);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

module.exports = router;
