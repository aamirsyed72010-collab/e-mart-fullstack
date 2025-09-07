const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const Wishlist = require('../models/Wishlist');
const {ensureAuthenticated} = require('../middleware/auth');

// @route   GET api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({user: req.user.id}).populate('product');
    res.json(wishlist);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/wishlist/add
// @desc    Add a product to wishlist
// @access  Private
router.post('/add',
    ensureAuthenticated,
    [check('productId', 'Product ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {productId} = req.body;

      try {
        // Check if already in wishlist
        const existingItem = await Wishlist.findOne({user: req.user.id, product: productId});
        if (existingItem) {
          return res.status(400).json({msg: 'Product already in wishlist'});
        }

        const newItem = new Wishlist({
          user: req.user.id,
          product: productId,
        });

        await newItem.save();
        res.status(201).json(newItem);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   DELETE api/wishlist/remove/:productId
// @desc    Remove a product from wishlist
// @access  Private
router.delete('/remove/:productId',
    ensureAuthenticated,
    [check('productId', 'Product ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        const item = await Wishlist.findOne({user: req.user.id, product: req.params.productId});
        if (!item) {
          return res.status(404).json({msg: 'Item not found in wishlist'});
        }

        await item.deleteOne();
        res.json({msg: 'Item removed from wishlist'});
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

module.exports = router;
