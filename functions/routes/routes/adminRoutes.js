const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {check, validationResult} = require('express-validator');
const SellerRequest = require('../../models/models/SellerRequest');
const User = require('../../models/models/User');
const Product = require('../../models/models/Product');
const AdminRequest = require('../../models/models/AdminRequest');
const {ensureAuthenticated, ensureRole} = require('../../middleware/middleware/auth');


// @route   GET /api/admin/seller-requests
// @desc    Get all pending seller requests
// @access  Private (Admin only)
router.get('/seller-requests', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
  try {
    const requests = await SellerRequest.find({status: 'pending'})
        .populate('user', 'displayName email'); // Populate user info
    res.json(requests);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/admin/manage-seller-request/:requestId
// @desc    Approve or deny a seller request
// @access  Private (Admin only)
router.post('/manage-seller-request/:requestId',
    ensureAuthenticated,
    ensureRole('admin'),
    [check('requestId', 'Request ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }

      const {action} = req.body; // 'approve' or 'deny'

      if (action !== 'approved' && action !== 'denied') {
        return res.status(400).json({msg: 'Invalid action. Must be "approve" or "deny".'});
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const request = await SellerRequest.findById(req.params.requestId).session(session);

        if (!request) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({msg: 'Seller request not found.'});
        }

        if (request.status !== 'pending') {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({msg: 'Request has already been reviewed.'});
        }

        request.status = action;
        request.reviewedAt = Date.now();

        if (action === 'approved') {
        // Update user's role to 'seller'
          const user = await User.findById(request.user).session(session);
          if (user) {
            user.role = 'seller';
            await user.save({session});
          }
        }

        await request.save({session});

        await session.commitTransaction();
        session.endSession();

        if (action === 'approved') {
          res.json({msg: 'Seller request approved and user role updated.'});
        } else { // action === 'denied'
          res.json({msg: 'Seller request denied.'});
        }
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-googleId'); // Exclude googleId for security
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Update a user\'s role
// @access  Private (Admin only)
router.put('/users/:id/role',
    ensureAuthenticated,
    ensureRole('admin'),
    [check('id', 'User ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {role} = req.body;

      if (!['user', 'seller', 'admin'].includes(role)) {
        return res.status(400).json({msg: 'Invalid role'});
      }

      try {
        const user = await User.findById(req.params.id);
        if (!user) {
          return res.status(404).json({msg: 'User not found'});
        }

        user.role = role;
        await user.save();
        res.json(user);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/users/:id',
    ensureAuthenticated,
    ensureRole('admin'),
    [check('id', 'User ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        const user = await User.findById(req.params.id);
        if (!user) {
          return res.status(404).json({msg: 'User not found'});
        }

        if (user.id === req.user.id) {
          return res.status(400).json({msg: 'You cannot delete your own account.'});
        }

        await user.deleteOne();
        res.json({msg: 'User deleted'});
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET api/admin/products
// @desc    Get all products (for admin)
// @access  Private (Admin only)
router.get('/products', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
  try {
    const products = await Product.find().populate('seller', 'displayName');
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/admin/products/:id
// @desc    Delete any product (for admin)
// @access  Private (Admin only)
router.delete('/products/:id',
    ensureAuthenticated,
    ensureRole('admin'),
    [check('id', 'Product ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        const product = await Product.findById(req.params.id);
        if (!product) {
          return res.status(404).json({msg: 'Product not found'});
        }
        await product.deleteOne();
        res.json({msg: 'Product deleted by admin'});
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   DELETE api/admin/reviews/:productId/:reviewId
// @desc    Delete a review (for admin)
// @access  Private (Admin only)
router.delete('/reviews/:productId/:reviewId',
    ensureAuthenticated,
    ensureRole('admin'),
    [
      check('productId', 'Product ID is not valid').isMongoId(),
      check('reviewId', 'Review ID is not valid').isMongoId(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
          return res.status(404).json({msg: 'Product not found'});
        }

        const review = product.reviews.id(req.params.reviewId);
        if (!review) {
          return res.status(404).json({msg: 'Review not found'});
        }

        review.deleteOne();
        await product.save();

        res.json({msg: 'Review deleted by admin'});
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET /api/admin/admin-requests
// @desc    Get all pending admin requests
// @access  Private (Admin only)
router.get('/admin-requests', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
  try {
    const requests = await AdminRequest.find({status: 'pending'}).populate('user', 'displayName email');
    res.json(requests);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/admin/manage-admin-request/:requestId
// @desc    Approve or deny an admin request
// @access  Private (Admin only)
router.post('/manage-admin-request/:requestId',
    ensureAuthenticated,
    ensureRole('admin'),
    [check('requestId', 'Request ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }

      const {action} = req.body; // 'approved' or 'denied'

      if (action !== 'approved' && action !== 'denied') {
        return res.status(400).json({msg: 'Invalid action. Must be "approved" or "denied".'});
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const request = await AdminRequest.findById(req.params.requestId).session(session);

        if (!request) {
          await session.abortTransaction();
          session.endSession();
          return res.status(404).json({msg: 'Admin request not found.'});
        }

        if (request.status !== 'pending') {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({msg: 'Request has already been reviewed.'});
        }

        request.status = action;
        request.reviewedAt = Date.now();

        if (action === 'approved') {
          const user = await User.findById(request.user).session(session);
          if (user) {
            user.role = 'admin';
            await user.save({session});
          }
        }

        await request.save({session});

        await session.commitTransaction();
        session.endSession();

        if (action === 'approved') {
          res.json({msg: 'Admin request approved and user role updated.'});
        } else {
          res.json({msg: 'Admin request denied.'});
        }
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

module.exports = router;