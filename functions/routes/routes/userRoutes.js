const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {check, validationResult} = require('express-validator');
const {ensureAuthenticated} = require('../middleware/auth');
const AdminRequest = require('../models/AdminRequest');
const SellerRequest = require('../models/SellerRequest');

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
    ensureAuthenticated,
    [
      check('displayName', 'Display name must be a string').optional().isString(),
      check('shippingAddress.fullName', 'Full name must be a string').optional().isString(),
      check('shippingAddress.houseNo', 'House number must be a string').optional().isString(),
      check('shippingAddress.streetName', 'Street name must be a string').optional().isString(),
      check('shippingAddress.city', 'City must be a string').optional().isString(),
      check('shippingAddress.district', 'District must be a string').optional().isString(),
      check('shippingAddress.taluk', 'Taluk must be a string').optional().isString(),
      check('shippingAddress.postalCode', 'Postal code must be a string').optional().isString(),
      check('shippingAddress.country', 'Country must be a string').optional().isString(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {displayName, shippingAddress} = req.body;

      try {
        const user = await User.findById(req.user.id);

        if (!user) {
          return res.status(404).json({msg: 'User not found'});
        }

        user.displayName = displayName || user.displayName;
        if (shippingAddress) {
          user.shippingAddress = {
            fullName: shippingAddress.fullName || user.shippingAddress.fullName,
            houseNo: shippingAddress.houseNo || user.shippingAddress.houseNo, // New
            streetName: shippingAddress.streetName || user.shippingAddress.streetName, // New
            address: shippingAddress.address || user.shippingAddress.address,
            city: shippingAddress.city || user.shippingAddress.city,
            district: shippingAddress.district || user.shippingAddress.district, // New
            taluk: shippingAddress.taluk || user.shippingAddress.taluk, // New
            postalCode: shippingAddress.postalCode || user.shippingAddress.postalCode,
            country: shippingAddress.country || user.shippingAddress.country,
          };
        }

        await user.save();
        res.json(user);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET api/users/seller-request-status
// @desc    Get the status of the authenticated user's seller request
// @access  Private
router.get('/seller-request-status', ensureAuthenticated, async (req, res) => {
  try {
    const request = await SellerRequest.findOne({user: req.user.id}).sort({requestedAt: -1}); // Get the latest request
    if (!request) {
      return res.status(200).json({status: 'none'});
    }
    res.status(200).json({status: request.status});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET api/users/admin-request-status
// @desc    Get the status of the authenticated user's admin request
// @access  Private
router.get('/admin-request-status', ensureAuthenticated, async (req, res) => {
  try {
    const request = await AdminRequest.findOne({user: req.user.id}).sort({requestedAt: -1}); // Get the latest request
    if (!request) {
      return res.status(200).json({status: 'none'});
    }
    res.status(200).json({status: request.status});
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
