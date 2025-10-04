const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register only 2 users
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userCount = await User.countDocuments();
        if(userCount >= 2) return res.status(403).json({ message: 'Tangi allows only 2 users' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch(err) {
        res.status(500).json({ message: 'Server error', err });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if(!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ user: { id: user._id } }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch(err) {
        res.status(500).json({ message: 'Server error', err });
    }
});

// Get all users (for frontend to pick other user)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, '_id username'); // only _id & username
        res.json(users);
    } catch(err) {
        res.status(500).json({ message: 'Server error', err });
    }
});

module.exports = router;
