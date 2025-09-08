const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {check, validationResult} = require('express-validator');
const SellerRequest = require('../../models/models/SellerRequest');
const User = require('../../models/models/User');
const Product = require('../../models/models/Product');
const AdminRequest = require('../../models/models/AdminRequest');
const {ensureAuthenticated, ensureRole} = require('../../middleware/middleware/auth');


// @route   POST /api/users/request-seller-role
// @desc    Submit a request to become a seller
// @access  Private (Authenticated users only)
router.post('/users/request-seller-role', ensureAuthenticated, async (req, res) => {
  const {phoneNumber, address, desiredCategories} = req.body;

  // Basic validation
  if (!phoneNumber || !address || !desiredCategories || desiredCategories.length === 0) {
    return res.status(400).json({msg: 'Please fill in all required fields for seller request.'});
  }

  try {
    // Check if user already has a pending request
    const existingRequest = await SellerRequest.findOne({user: req.user.id, status: 'pending'});
    if (existingRequest) {
      return res.status(400).json({msg: 'You already have a pending seller request.'});
    }

    // Create new seller request
    const newRequest = new SellerRequest({
      user: req.user.id,
      phoneNumber,
      address,
      desiredCategories,
      status: 'pending',
    });

    await newRequest.save();
    res.status(201).json({msg: 'Seller request submitted successfully. Awaiting review.'});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/seller-requests
// @desc    Get all pending seller requests
// @access  Private (Admin only)
router.get('/admin/seller-requests', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
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
router.post('/admin/manage-seller-request/:requestId',
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
router.get('/admin/users', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-googleId'); // Exclude googleId for security
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/admin/users/:id/role
// @desc    Update a user's role
// @access  Private (Admin only)
router.put('/admin/users/:id/role',
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
router.delete('/admin/users/:id',
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
router.get('/admin/products', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
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
router.delete('/admin/products/:id',
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
router.delete('/admin/reviews/:productId/:reviewId',
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

// @route   POST /api/users/request-admin-role
// @desc    Submit a request to become an admin
// @access  Private (Authenticated users only)
router.post('/users/request-admin-role', ensureAuthenticated, async (req, res) => {
  const {reason} = req.body;

  if (!reason) {
    return res.status(400).json({msg: 'A reason is required to request admin role.'});
  }

  try {
    const existingRequest = await AdminRequest.findOne({user: req.user.id, status: 'pending'});
    if (existingRequest) {
      return res.status(400).json({msg: 'You already have a pending admin request.'});
    }

    const newRequest = new AdminRequest({
      user: req.user.id,
      reason,
      status: 'pending',
    });

    await newRequest.save();
    res.status(201).json({msg: 'Admin request submitted successfully. Awaiting review.'});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/admin-requests
// @desc    Get all pending admin requests
// @access  Private (Admin only)
router.get('/admin/admin-requests', ensureAuthenticated, ensureRole('admin'), async (req, res) => {
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
router.post('/admin/manage-admin-request/:requestId',
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
