const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const QandA = require('../../models/models/QandA');

const {ensureAuthenticated} = require('../../middleware/middleware/auth');

// @route   GET api/qanda/:productId
// @desc    Get all Q&A for a product
// @access  Public
router.get('/:productId',
    [check('productId', 'Product ID is not valid').isMongoId()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        const qandas = await QandA.find({product: req.params.productId})
            .populate('user', 'displayName profilePicture')
            .populate('seller', 'displayName profilePicture')
            .sort({createdAt: -1});
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
    ensureAuthenticated,
    [
      check('productId', 'Product ID is not valid').isMongoId(),
      check('question', 'Question field is required.').not().isEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {question} = req.body;

      try {
        const newQandA = new QandA({
          product: req.params.productId,
          question,
          user: req.user.id,
        });

        const qanda = await newQandA.save();
        res.status(201).json(qanda);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   POST api/qanda/answer/:questionId
// @desc    Answer a question
// @access  Private (Seller of the product only)
router.post('/answer/:questionId',
    ensureAuthenticated,
    [
      check('questionId', 'Question ID is not valid').isMongoId(),
      check('answer', 'Answer field is required.').not().isEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      const {answer} = req.body;

      try {
        const question = await QandA.findById(req.params.questionId).populate('product');
        if (!question) {
          return res.status(404).json({msg: 'Question not found.'});
        }

        // Check if the logged-in user is the seller of the product or an admin
        if (question.product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(403).json({msg: 'Not authorized to answer this question.'});
        }

        question.answer = answer;
        question.seller = req.user.id;
        question.answeredAt = Date.now();

        await question.save();
        res.json(question);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

module.exports = router;
