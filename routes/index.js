const express=require('express');
const route=express.Router();
const User = require('../models/User');

route.use(express.json());

// Create a new user (POST )



route.post('/signup', async (req, res) => {
    try {
        console.log(req.body);
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ message: 'User created', user });
        res.redirect('/');
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Get all users (GET /users)
route.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



route.get('/',(req,res)=>{
    res.render('main');
})


module.exports= route;