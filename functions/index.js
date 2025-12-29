const functions = require("firebase-functions");
console.log("--- FUNCTIONS INDEX LOADED ---");

const express = require("express");
// const cors = require("cors");
const admin = require("firebase-admin");
const rateLimit = require("express-rate-limit");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore(); // Initialize Firestore

const app = express();

// --- Middleware ---
app.set("trust proxy", 1);

// Manual CORS Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
if (process.env.NODE_ENV === "production") {
  app.use("/api", apiLimiter);
}

// --- New Authentication Middleware ---
const ensureAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ msg: "Unauthorized: No token provided." });
  }
  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; // Attach Firebase user claims to req.user

    // Also fetch our own user profile from Firestore
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      // If the user doesn't exist in Firestore, create them.
      // This happens on the first API call after signing up.
      const { email, name, picture } = decodedToken;
      const newUser = {
        displayName: name,
        email: email,
        profilePicture: picture,
        role: "user", // Default role
        createdAt: new Date().toISOString(),
        shippingAddress: {},
      };
      await db.collection("users").doc(decodedToken.uid).set(newUser);
      req.firestoreUser = newUser; // Attach the new profile
    } else {
      req.firestoreUser = userDoc.data(); // Attach existing profile
    }

    return next();
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error);
    return res.status(403).json({ msg: "Unauthorized: Invalid token." });
  }
};

// --- API Router ---
const apiRouter = express.Router();

// Attach the new middleware to all API routes that need authentication
// Note: I will need to go into each route file and remove the old middleware
// and potentially adapt the logic to use req.user (from token) and req.firestoreUser
apiRouter.use("/products", require("./routes/productRoutes"));
apiRouter.use("/cart", require("./routes/cartRoutes"));
apiRouter.use("/orders", require("./routes/orderRoutes"));
apiRouter.use("/wishlist", require("./routes/wishlistRoutes"));
apiRouter.use("/users", require("./routes/userRoutes"));
apiRouter.use("/qanda", require("./routes/qandaRoutes"));
apiRouter.use("/admin", require("./routes/adminRoutes"));

// Auth status route - now uses the new middleware
apiRouter.get("/current_user", ensureAuthenticated, (req, res) => {
  // req.firestoreUser is attached by the ensureAuthenticated middleware
  res.json(req.firestoreUser);
});

// Logout is now handled entirely on the client-side by the Firebase SDK
// This server endpoint is no longer necessary.
// We will remove the call to it from the frontend later.
apiRouter.get("/logout", (req, res) => {
  res.status(200).json({ msg: "Logout is a client-side operation." });
});

// Mount the API router
app.use("/", apiRouter);

// Root health check
app.get("/", (req, res) => {
  res.send("E-Mart API is running with Firestore!");
});

// Centralized Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "An unexpected error occurred.";
  }
  res.status(statusCode).json({ msg: message });
});

// Pass the db instance to the routes that need it
// This is a way to provide db access without a global
app.set("db", db);
app.set("ensureAuthenticated", ensureAuthenticated);

exports.api2 = functions.https.onRequest({ cors: false }, app);
