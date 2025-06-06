require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const routepath = require('./routes/index');
const expressSession = require("express-session");
const passport = require("passport");
const connectDB = require('./db/mongo');
const flash = require('connect-flash');

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Flash messages middleware
app.use(flash());

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// Load passport configuration
require('./config/passport');

// Make user and flash messages available to all views
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

// Routes
app.use('/', routepath);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', { 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
