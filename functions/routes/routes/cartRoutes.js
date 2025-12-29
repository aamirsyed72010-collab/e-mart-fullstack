const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const CartItem = require('../../models/models/Cart');
const {ensureAuthenticated} = require('../../middleware/middleware/auth');

// @route   POST api/cart/add
// @desc    Add an item to the cart
// @access  Private
router.post('/add',
    ensureAuthenticated,
    [
      check('productId', 'Product ID is not valid').isMongoId(),
      check('quantity', 'Quantity must be a positive integer').isInt({min: 1}),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {productId, quantity} = req.body;

      try {
        // Check if item exists for this user, if so, update quantity, otherwise create new.
        let cartItem = await CartItem.findOne({product: productId, user: req.user.id});

        if (cartItem) {
          cartItem.quantity += quantity;
        } else {
          cartItem = new CartItem({
            product: productId,
            quantity,
            user: req.user.id,
          });
        }

        const item = await cartItem.save();
        res.json(item);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET api/cart
// @desc    Get all cart items for a user
// @access  Private
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const items = await CartItem.find({user: req.user.id}).populate('product');
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
    ensureAuthenticated,
    [
      check('productId', 'Product ID is not valid').isMongoId(),
      check('quantity', 'Quantity must be a non-negative integer').isInt({min: 0}),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {quantity} = req.body;
      const {productId} = req.params;

      try {
        const cartItem = await CartItem.findOne({product: productId, user: req.user.id});

        if (!cartItem) {
          return res.status(404).json({msg: 'Cart item not found'});
        }

        if (quantity <= 0) {
        // If quantity is 0 or less, remove the item
          await cartItem.deleteOne(); // Mongoose 6.x+
          return res.json({msg: 'Item removed from cart'});
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        res.json(cartItem);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   DELETE api/cart/remove/:productId
// @desc    Remove an item from the cart
// @access  Private
router.delete('/remove/:productId',
    ensureAuthenticated,
    [check('productId', 'Product ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {productId} = req.params;

      try {
        const cartItem = await CartItem.findOne({product: productId, user: req.user.id});

        if (!cartItem) {
          return res.status(404).json({msg: 'Cart item not found'});
        }

        await cartItem.deleteOne(); // Mongoose 6.x+
        res.json({msg: 'Item removed from cart'});
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

module.exports = router;
