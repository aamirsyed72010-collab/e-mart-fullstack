const functions = require('firebase-functions');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const admin = require('firebase-admin');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// --- Configuration Loading ---
let config;
if (process.env.NODE_ENV === 'production') {
  config = functions.config().env;
} else {
  require('dotenv').config();
  config = process.env;
}

// Check for required environment variables
if (!config.MONGO_URI || !config.SESSION_SECRET) {
  console.error('FATAL ERROR: MONGO_URI and SESSION_SECRET must be defined in your environment configuration.');
  process.exit(1);
}
// --- End Configuration Loading ---


const User = require('./models/User'); // Import User model
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes

const app = express();

// Initialize Firebase Admin SDK
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Determine frontend URL based on environment
const prodFrontendUrl = config.FRONTEND_URL_PROD || `https://${process.env.GCLOUD_PROJECT}.web.app`;
const frontendUrl = process.env.NODE_ENV === 'production' ? prodFrontendUrl : config.FRONTEND_URL_DEV;
console.log('Backend NODE_ENV:', process.env.NODE_ENV);
console.log('Backend frontendUrl for CORS:', frontendUrl);

// Middleware
app.use(cors({
  origin: [frontendUrl, 'http://127.0.0.1:5000', 'http://localhost:5000'], // Allow frontend and emulators
  credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use(helmet()); // Add Helmet.js for security headers

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

// Apply to all requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply to all requests that start with /api/
app.use('/api/', apiLimiter);

// Specific limiter for authentication route
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply the authentication limiter to the Google callback route
app.use('/api/auth/google/callback', authLimiter);

// Configure session middleware
app.use(session({
  secret: config.SESSION_SECRET, // Use a strong secret from .env
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(config.MONGO_URI).then(() => {
  console.log('MongoDB connected successfully.');
}).catch((error) => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});


// Passport serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id); // Store MongoDB user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user); // Attach the full user object to req.user
  } catch (err) {
    console.error(err);
    done(err, null);
  }
});

// Firebase ID token verification and session creation
app.post('/api/auth/google/callback', async (req, res) => {
  const authHeader = req.headers.authorization;
  const idToken = authHeader && authHeader.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({msg: 'No ID token provided'});
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const {uid, email, name, picture} = decodedToken;

    let user = await User.findOne({email: email});

    if (!user) {
      // Create new user if not found
      user = new User({
        googleId: uid, // Using Firebase UID as googleId
        displayName: name,
        email: email,
        profilePicture: picture,
        role: 'user', // Default role
      });
      
      await user.save();
    } else {
      // User exists, check if we need to update them.
      let needsSave = false;
      if (user.googleId !== uid) {
        user.googleId = uid;
        needsSave = true;
      }
      if (!user.role) { // For other existing users without a role
        user.role = 'user';
        needsSave = true;
      }


      

      if (needsSave) {
        await user.save();
      }
    }

    // Log in the user using Passport's login function
    req.login(user, (err) => {
      if (err) {
        console.error('Error logging in user:', err);
        return res.status(500).json({msg: 'Failed to log in user'});
      }
      res.status(200).json({msg: 'Authentication successful', user: req.user});
    });
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.status(401).json({msg: 'Unauthorized: Invalid ID token'});
  }
});

// Define Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/qanda', require('./routes/qandaRoutes'));
app.use('/api', adminRoutes); // Mount admin routes under /api

// Route to check if user is logged in
app.get('/api/current_user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    // Send a 200 status with null body, which is valid JSON
    res.status(200).json(null);
  }
});

// Route to log out
app.get('/api/logout', (req, res, next) => {
  req.logout((err) => { // req.logout is added by passport
    if (err) {
      return next(err);
    }
    res.redirect(frontendUrl); // Redirect to frontend homepage
  });
});

// A simple test route
app.get('/api', (req, res) => {
  res.send('E-Mart API is running!');
});

// Centralized Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error(err.stack); // Log the error stack for debugging

  // Default error status and message
  const statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // In production, don't leak internal error details
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred.';
  }

  res.status(statusCode).json({msg: message});
});


exports.api = functions.https.onRequest(app);
