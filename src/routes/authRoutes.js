const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res, next) => {
    try {
        const { fullName, email, password } = req.body;
        const user = new User({ fullName, email, password });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, id: user._id});
    } catch (error) {
        next(error);
    }
});

module.exports = router;