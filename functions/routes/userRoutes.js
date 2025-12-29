const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// Note: We no longer require the Mongoose models.

router.use((req, res, next) => {
  // Make the db and middleware available in this router
  req.db = req.app.get('db');
  req.ensureAuthenticated = req.app.get('ensureAuthenticated');
  next();
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [
    check('displayName', 'Display name must be a string').optional().isString(),
    // Add validation for other fields as needed
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { displayName, shippingAddress } = req.body;
    const userId = req.user.uid;

    try {
      const userRef = req.db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const updateData = {};
      if (displayName) {
        updateData.displayName = displayName;
      }
      if (shippingAddress) {
        // Deep merge for shipping address to not overwrite existing fields
        updateData.shippingAddress = { ...userDoc.data().shippingAddress, ...shippingAddress };
      }

      await userRef.update(updateData);
      const updatedUserDoc = await userRef.get();
      res.json(updatedUserDoc.data());
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/users/seller-request-status
// @desc    Get the status of the authenticated user's seller request
// @access  Private
router.get('/seller-request-status', (req, res, next) => req.ensureAuthenticated(req, res, next), async (req, res) => {
  try {
    const requestsSnapshot = await req.db.collection('sellerRequests')
      .where('userId', '==', req.user.uid)
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();

    if (requestsSnapshot.empty) {
      return res.status(200).json({ status: 'none' });
    }
    const latestRequest = requestsSnapshot.docs[0].data();
    res.status(200).json({ status: latestRequest.status });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/admin-request-status
// @desc    Get the status of the authenticated user's admin request
// @access  Private
router.get('/admin-request-status', (req, res, next) => req.ensureAuthenticated(req, res, next), async (req, res) => {
  try {
    const requestsSnapshot = await req.db.collection('adminRequests')
      .where('userId', '==', req.user.uid)
      .orderBy('requestedAt', 'desc')
      .limit(1)
      .get();

    if (requestsSnapshot.empty) {
      return res.status(200).json({ status: 'none' });
    }
    const latestRequest = requestsSnapshot.docs[0].data();
    res.status(200).json({ status: latestRequest.status });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/request-seller-role
// @desc    Submit a request to become a seller
// @access  Private
router.post('/request-seller-role', (req, res, next) => req.ensureAuthenticated(req, res, next), async (req, res) => {
  const { phoneNumber, address, desiredCategories } = req.body;

  if (!phoneNumber || !address || !desiredCategories || desiredCategories.length === 0) {
    return res.status(400).json({ msg: 'Please fill in all required fields for seller request.' });
  }

  try {
    const existingRequestQuery = await req.db.collection('sellerRequests')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'pending')
      .get();

    if (!existingRequestQuery.empty) {
      return res.status(400).json({ msg: 'You already have a pending seller request.' });
    }

    const newRequest = {
      userId: req.user.uid,
      user: { // Denormalize user info for easier review in the admin panel
        displayName: req.firestoreUser.displayName,
        email: req.firestoreUser.email,
      },
      phoneNumber,
      address,
      desiredCategories,
      status: 'pending',
      requestedAt: new Date(),
    };

    await req.db.collection('sellerRequests').add(newRequest);
    res.status(201).json({ msg: 'Seller request submitted successfully. Awaiting review.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/users/request-admin-role
// @desc    Submit a request to become an admin
// @access  Private
router.post('/request-admin-role', (req, res, next) => req.ensureAuthenticated(req, res, next), async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ msg: 'A reason is required to request admin role.' });
  }

  try {
    const existingRequestQuery = await req.db.collection('adminRequests')
      .where('userId', '==', req.user.uid)
      .where('status', '==', 'pending')
      .get();

    if (!existingRequestQuery.empty) {
      return res.status(400).json({ msg: 'You already have a pending admin request.' });
    }

    const newRequest = {
      userId: req.user.uid,
      user: { // Denormalize user info
        displayName: req.firestoreUser.displayName,
        email: req.firestoreUser.email,
      },
      reason,
      status: 'pending',
      requestedAt: new Date(),
    };

    await req.db.collection('adminRequests').add(newRequest);
    res.status(201).json({ msg: 'Admin request submitted successfully. Awaiting review.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
