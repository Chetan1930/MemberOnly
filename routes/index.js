const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// Middleware to check if user is not authenticated
const isNotAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/welcome');
};

// Home page
router.get('/', (req, res) => {
  res.render('home', { user: req.user });
});

// Login page
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('login', { error: req.flash('error') });
});

// Register page
router.get('/register', isNotAuthenticated, (req, res) => {
  res.render('register', { error: req.flash('error') });
});

// Welcome page (protected route)
router.get('/welcome', isAuthenticated, (req, res) => {
  res.render('welcome', { user: req.user });
});

// Login handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      req.flash('error', 'An error occurred during login');
      return res.redirect('/login');
    }
    if (!user) {
      req.flash('error', info.message || 'Invalid username or password');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        req.flash('error', 'An error occurred during login');
        return res.redirect('/login');
      }
      return res.redirect('/welcome');
    });
  })(req, res, next);
});

// Register handler
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      req.flash('error', 'All fields are required');
      return res.redirect('/register');
    }

    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters long');
      return res.redirect('/register');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      req.flash('error', 'Username or email already exists');
      return res.redirect('/register');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Log the user in after registration
    req.login(user, (err) => {
      if (err) {
        console.error('Error during auto-login after registration:', err);
        req.flash('error', 'Registration successful, please login');
        return res.redirect('/login');
      }
      req.flash('success', 'Registration successful!');
      res.redirect('/welcome');
    });

  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Error during registration. Please try again.');
    res.redirect('/register');
  }
});

// Logout handler
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.redirect('/welcome');
    }
    req.flash('success', 'Successfully logged out');
    res.redirect('/');
  });
});

// Protected route example
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

// Get all users (protected route)
router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

router.get('/enter',(req,res)=>{
    res.render('main');
})

module.exports = router;