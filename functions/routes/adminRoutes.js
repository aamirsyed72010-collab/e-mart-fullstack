const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

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

const adminOnly = (req, res, next) => req.ensureRole('admin')(req, res, next);
const auth = (req, res, next) => req.ensureAuthenticated(req, res, next);

// --- Seller Request Management ---
router.get('/seller-requests', auth, adminOnly, async (req, res) => {
  try {
    const snapshot = await req.db.collection('sellerRequests').where('status', '==', 'pending').get();
    const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(requests);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.post('/manage-seller-request/:requestId', auth, adminOnly, async (req, res) => {
  const { action } = req.body;
  if (!['approved', 'denied'].includes(action)) {
    return res.status(400).json({ msg: 'Invalid action.' });
  }

  const requestRef = req.db.collection('sellerRequests').doc(req.params.requestId);

  try {
    await req.db.runTransaction(async (t) => {
      const requestDoc = await t.get(requestRef);
      if (!requestDoc.exists || requestDoc.data().status !== 'pending') {
        throw new Error('Request not found or already reviewed.');
      }

      t.update(requestRef, { status: action, reviewedAt: new Date() });

      if (action === 'approved') {
        const userRef = req.db.collection('users').doc(requestDoc.data().userId);
        t.update(userRef, { role: 'seller' });
      }
    });
    res.json({ msg: `Seller request ${action}.` });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: error.message });
  }
});

// --- User Management ---
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const snapshot = await req.db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.put('/users/:id/role', auth, adminOnly, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'seller', 'admin'].includes(role)) {
    return res.status(400).json({ msg: 'Invalid role' });
  }
  try {
    const userRef = req.db.collection('users').doc(req.params.id);
    await userRef.update({ role });
    res.json({ msg: 'User role updated.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.user.uid) {
      return res.status(400).json({ msg: 'You cannot delete your own account.' });
    }
    // Delete from Firestore and Firebase Auth
    await req.db.collection('users').doc(userId).delete();
    await admin.auth().deleteUser(userId);
    res.json({ msg: 'User deleted successfully from Firestore and Auth.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// --- Product Management ---
router.get('/products', auth, adminOnly, async (req, res) => {
  try {
    const productsSnapshot = await req.db.collection('products').get();
    const products = await Promise.all(productsSnapshot.docs.map(async (doc) => {
      const product = { id: doc.id, ...doc.data() };
      if (product.seller) {
        const sellerDoc = await req.db.collection('users').doc(product.seller).get();
        if (sellerDoc.exists) {
          product.seller = { displayName: sellerDoc.data().displayName };
        } else {
          product.seller = { displayName: 'Unknown' };
        }
      }
      return product;
    }));
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

router.delete('/products/:id', auth, adminOnly, async (req, res) => {
  try {
    await req.db.collection('products').doc(req.params.id).delete();
    res.json({ msg: 'Product permanently deleted.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// --- Review Management ---
router.delete('/reviews/:productId/:reviewId', auth, adminOnly, async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const productRef = req.db.collection('products').doc(productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const product = productDoc.data();
        const reviewToRemove = product.reviews.find(r => r._id === reviewId);

        if (!reviewToRemove) {
            return res.status(404).json({ msg: 'Review not found' });
        }

        await productRef.update({
            reviews: admin.firestore.FieldValue.arrayRemove(reviewToRemove)
        });

        res.json({ msg: 'Review deleted by admin' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


// --- Admin Request Management ---
router.get('/admin-requests', auth, adminOnly, async (req, res) => {
    try {
        const snapshot = await req.db.collection('adminRequests').where('status', '==', 'pending').get();
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(requests);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.post('/manage-admin-request/:requestId', auth, adminOnly, async (req, res) => {
    const { action } = req.body;
    if (!['approved', 'denied'].includes(action)) {
        return res.status(400).json({ msg: 'Invalid action.' });
    }

    const requestRef = req.db.collection('adminRequests').doc(req.params.requestId);

    try {
        await req.db.runTransaction(async (t) => {
            const requestDoc = await t.get(requestRef);
            if (!requestDoc.exists || requestDoc.data().status !== 'pending') {
                throw new Error('Request not found or already reviewed.');
            }

            t.update(requestRef, { status: action, reviewedAt: new Date() });

            if (action === 'approved') {
                const userRef = req.db.collection('users').doc(requestDoc.data().userId);
                t.update(userRef, { role: 'admin' });
            }
        });
        res.json({ msg: `Admin request ${action}.` });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ msg: error.message });
    }
});

module.exports = router;
