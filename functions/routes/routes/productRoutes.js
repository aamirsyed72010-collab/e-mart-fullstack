
const express = require('express');
const router = express.Router();
const Product = require('../../models/models/Product');
const {ensureAuthenticated, ensureRole} = require('../../middleware/middleware/auth');
const {check, validationResult} = require('express-validator');

// @route   GET api/products/search
// @desc    Search for products
// @access  Public
// @route   GET api/products/seller/my-products
// @desc    Get all products for the logged-in seller
// @access  Private (Seller only)
router.get('/seller/my-products', ensureAuthenticated, ensureRole('seller'), async (req, res) => {
  try {
    const products = await Product.find({seller: req.user.id});
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/seller/analytics
// @desc    Get analytics for the logged-in seller
// @access  Private (Seller only)
router.get('/seller/analytics', ensureAuthenticated, ensureRole('seller'), async (req, res) => {
  try {
    const products = await Product.find({seller: req.user.id});

    if (!products) {
      return res.status(404).json({msg: 'No products found for this seller.'});
    }

    const totalProducts = products.length;
    const totalStock = products.reduce((acc, product) => acc + product.stock, 0);
    const totalViews = products.reduce((acc, product) => acc + product.views, 0);
    const totalSales = products.reduce((acc, product) => acc + product.sales, 0);

    const topViewed = [...products].sort((a, b) => b.views - a.views).slice(0, 5);
    const topSold = [...products].sort((a, b) => b.sales - a.sales).slice(0, 5);

    res.json({
      totalProducts,
      totalStock,
      totalViews,
      totalSales,
      topViewed,
      topSold,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/products/search
// @desc    Search for products
// @access  Public
router.get('/search',
    [
      check('q', 'Search query is required').not().isEmpty(),
      check('category', 'Category must be a string').optional().isString(),
      check('tags', 'Tags must be a string').optional().isString(),
      check('sortBy', 'SortBy must be a string').optional().isString(),
      check('price_min', 'Minimum price must be a number').optional().isNumeric(),
      check('price_max', 'Maximum price must be a number').optional().isNumeric(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        const {q, category, tags, sortBy, price_min, price_max} = req.query;

        const query = {
          $or: [
            {name: {$regex: q, $options: 'i'}},
            {description: {$regex: q, $options: 'i'}},
            {tags: {$regex: q, $options: 'i'}},
          ],
        };
        const sort = {};

        if (category) {
          query.category = category;
        }

        if (tags) {
          query.tags = {$in: tags.split(',')};
        }

        if (price_min || price_max) {
          query.price = {};
          if (price_min) {
            query.price.$gte = Number(price_min);
          }
          if (price_max) {
            query.price.$lte = Number(price_max);
          }
        }

        switch (sortBy) {
          case 'price_asc':
            sort.price = 1;
            break;
          case 'price_desc':
            sort.price = -1;
            break;
          case 'newest':
            sort.createdAt = -1;
            break;
          default:
            sort.createdAt = -1;
        }

        const products = await Product.find(query).sort(sort);
        res.json(products);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   POST api/products
// @desc    Add a new product
// @access  Private (Seller only)
router.post(
    '/',
    ensureAuthenticated,
    ensureRole('seller'),
    [
      check('name', 'Product name is required').notEmpty(),
      check('description', 'Description is required').notEmpty(),
      check('price', 'Price must be a positive number').isFloat({gt: 0}),
      check('imageUrl', 'Image URL must be a valid URL').isURL(),
      check('category', 'Category is required').notEmpty(),
      check('stock', 'Stock must be a non-negative integer').isInt({min: 0}),
      check('tags', 'At least one tag is required').isArray({min: 1}),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }

      const {name, description, price, imageUrl, category, tags, stock} = req.body;

      try {
        const newProduct = new Product({
          name,
          description,
          price,
          imageUrl,
          category,
          tags,
          stock,
          seller: req.user.id,
        });

        const product = await newProduct.save();
        res.status(201).json(product); // 201 Created
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    },
);

// @route   POST api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private (Authenticated users only)
router.post(
    '/:id/reviews',
    ensureAuthenticated,
    [
      check('id', 'Product ID is not valid').isMongoId(),
      check('rating', 'Rating is required and must be a number between 1 and 5').isFloat({min: 1, max: 5}),
      check('comment', 'Comment is required').notEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }

      const {rating, comment} = req.body;

      try {
        const product = await Product.findById(req.params.id);

        if (!product) {
          return res.status(404).json({msg: 'Product not found'});
        }

        // Create new review object
        const newReview = {
          user: req.user.id, // Get user ID from session
          rating: Number(rating),
          comment,
        };

        product.reviews.push(newReview); // Add review to product's reviews array
        await product.save(); // Save the updated product

        res.status(201).json({msg: 'Review added successfully', review: newReview});
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id',
    [check('id', 'Product ID is not valid').isMongoId()],
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        // Increment views atomically and get the updated product
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {$inc: {views: 1}},
            {new: true},
        ).populate('seller', 'displayName')
            .populate({
              path: 'reviews.user',
              select: 'displayName profilePicture', // Populate user info for reviews
            });

        if (!product) {
          const error = new Error('Product not found');
          error.statusCode = 404;
          return next(error);
        }

        res.json(product);
      } catch (error) {
        console.error(error.message);
        // Check if the error is due to an invalid ObjectId format
        if (error.kind === 'ObjectId') {
          const customError = new Error('Product not found');
          customError.statusCode = 404; // Use 404 for not found
          return next(customError);
        }
        next(error); // Pass other errors to the centralized error handler
      }
    });

// @route   GET api/products/recommendations/:productId
// @desc    Get product recommendations
// @access  Public
router.get('/recommendations/:productId',
    [check('productId', 'Product ID is not valid').isMongoId()],
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

        const recommendations = await Product.find({
          category: product.category,
          _id: {$ne: product._id}, // Exclude the current product
        }).limit(4); // Limit to 4 recommendations

        res.json(recommendations);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET api/products/compare
// @desc    Get multiple products for comparison by IDs
// @access  Public
router.get('/compare',
    [check('ids', 'Product IDs are required').not().isEmpty()],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }
      try {
        const {ids} = req.query;
        if (!ids) {
          return res.status(400).json({msg: 'Product IDs are required'});
        }

        const productIds = ids.split(',');

        // Find all products whose _id is in the productIds array
        const products = await Product.find({'_id': {$in: productIds}});

        if (!products || products.length === 0) {
          return res.status(404).json({msg: 'No products found for the given IDs'});
        }

        res.json(products);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {sortBy} = req.query;
    const sort = {};

    switch (sortBy) {
      case 'price_asc':
        sort.price = 1;
        break;
      case 'price_desc':
        sort.price = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    const products = await Product.find({}).sort(sort);
    res.json(products);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private (Seller only)
router.put('/:id',
    ensureAuthenticated,
    ensureRole('seller'),
    [
      check('id', 'Product ID is not valid').isMongoId(),
      check('name', 'Product name is required').notEmpty(),
      check('description', 'Description is required').notEmpty(),
      check('price', 'Price must be a positive number').isFloat({gt: 0}),
      check('imageUrl', 'Image URL must be a valid URL').isURL(),
      check('category', 'Category is required').notEmpty(),
      check('stock', 'Stock must be a non-negative integer').isInt({min: 0}),
      check('tags', 'At least one tag is required').isArray({min: 1}),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }

      try {
        let product = await Product.findById(req.params.id);

        if (!product) {
          return res.status(404).json({msg: 'Product not found'});
        }

        // Check if the user owns the product or is an admin
        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(401).json({msg: 'User not authorized'});
        }

        const {name, description, price, imageUrl, category, tags, stock} = req.body;
        product = await Product.findByIdAndUpdate(
            req.params.id,
            {$set: {name, description, price, imageUrl, category, tags, stock}},
            {new: true},
        );

        res.json(product);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private (Seller only)
router.delete('/:id',
    ensureAuthenticated,
    ensureRole('seller'),
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

        // Check if the user owns the product or is an admin
        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(401).json({msg: 'User not authorized'});
        }

        await product.deleteOne();

        res.json({msg: 'Product removed'});
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

// @route   PUT api/products/seller/update-stock/:id
// @desc    Update stock for a product
// @access  Private (Seller only)
router.put('/seller/update-stock/:id',
    ensureAuthenticated,
    ensureRole('seller'),
    [
      check('id', 'Product ID is not valid').isMongoId(),
      check('stock', 'Stock must be a non-negative integer').isInt({min: 0}),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
      }

      const {stock} = req.body;

      try {
        const product = await Product.findById(req.params.id);

        if (!product) {
          return res.status(404).json({msg: 'Product not found'});
        }

        // Check if the user owns the product or is an admin
        if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(401).json({msg: 'User not authorized'});
        }

        product.stock = stock;
        await product.save();

        res.json(product);
      } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
      }
    });

module.exports = router;
