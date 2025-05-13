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
router.post('/login', passport.authenticate('local', {
  successRedirect: '/welcome',
  failureRedirect: '/login',
  failureFlash: true
}));

// Register handler
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

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
        return res.redirect('/login');
      }
      res.redirect('/welcome');
    });

  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Error during registration');
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
    res.redirect('/');
  });
});

// Protected route example
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.user });
});

// Get all users (GET /users)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/enter',(req,res)=>{
    res.render('main');
})

module.exports = router;