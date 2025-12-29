const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

router.use((req, res, next) => {
  req.db = req.app.get('db');
  req.ensureAuthenticated = req.app.get('ensureAuthenticated');
  next();
});

// @route   GET api/qanda/:productId
// @desc    Get all Q&A for a product
// @access  Public
router.get('/:productId', 
  [check('productId', 'Product ID is not valid').isString()], 
  async (req, res) => {
  try {
        const qandaSnapshot = await req.db.collection('qanda')
      .where('product', '==', req.params.productId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const qandas = await Promise.all(qandaSnapshot.docs.map(async doc => {
        const data = doc.data();
        const userSnapshot = await req.db.collection('users').doc(data.user).get();
        const sellerSnapshot = data.seller ? await req.db.collection('users').doc(data.seller).get() : null;

        return {
            id: doc.id,
            ...data,
            user: userSnapshot.exists
              ? {
                  displayName: userSnapshot.data().displayName,
                  profilePicture: userSnapshot.data().profilePicture,
                }
              : null,
            seller:
              sellerSnapshot && sellerSnapshot.exists
                ? {
                    displayName: sellerSnapshot.data().displayName,
                    profilePicture: sellerSnapshot.data().profilePicture,
                  }
                : null,
        };
    }));

    res.json(qandas);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/qanda/ask/:productId
// @desc    Ask a new question
// @access  Private
router.post('/ask/:productId',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [
    check('productId', 'Product ID is not valid').isString(),
    check('question', 'Question field is required.').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { question } = req.body;

    try {
      const newQandA = {
        product: req.params.productId,
        question,
        user: req.user.uid,
        createdAt: new Date(),
        answer: null,
        seller: null,
        answeredAt: null,
      };

      const docRef = await req.db.collection('qanda').add(newQandA);
      res.status(201).json({ id: docRef.id, ...newQandA });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

// @route   POST api/qanda/answer/:questionId
// @desc    Answer a question
// @access  Private (Seller of the product only)
router.post('/answer/:questionId',
  (req, res, next) => req.ensureAuthenticated(req, res, next),
  [
    check('questionId', 'Question ID is not valid').isString(),
    check('answer', 'Answer field is required.').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { answer } = req.body;

    try {
      const qandaRef = req.db.collection('qanda').doc(req.params.questionId);
      const qandaDoc = await qandaRef.get();

      if (!qandaDoc.exists) {
        return res.status(404).json({ msg: 'Question not found.' });
      }

      const productRef = req.db.collection('products').doc(qandaDoc.data().product);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return res.status(404).json({ msg: 'Associated product not found.' });
      }

      if (productDoc.data().seller !== req.user.uid && req.firestoreUser.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to answer this question.' });
      }

      const updateData = {
        answer,
        seller: req.user.uid,
        answeredAt: new Date(),
      };

      await qandaRef.update(updateData);
      res.json({ id: qandaDoc.id, ...qandaDoc.data(), ...updateData });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;