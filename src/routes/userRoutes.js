const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');


// GET /api/user
// Get all users and return only email and fullName
router.get('/', authMiddleware, async (req, res) => {
    try {
      // Find all users excluding the requesting user
      const users = await User.find({ _id: { $ne: req.user._id } }).select('email fullName');
  
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;