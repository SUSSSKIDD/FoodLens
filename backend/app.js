const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
require('./config/passport');
const detectRoutes = require('./routes/detectRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();
const recipeRoutes = require('./routes/recipeRoutes');
const path = require('path');
const geminiRoutes = require('./routes/geminiRoutes');

// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://foodlens-3859a.web.app',
    'https://foodlens-3859a.firebaseapp.com',
    'https://backend-8123.uc.r.appspot.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://backend-8123.uc.r.appspot.com"]
    }
  }
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// API Routes
app.use('/api/recipe', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/detect', detectRoutes);
app.use('/api/gemini', geminiRoutes);

// Serve static files
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Catch-all route for SPA
// app.get('*', (req, res) => {
//   res.sendFile(path.join(publicPath, 'index.html'));
// });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = app;