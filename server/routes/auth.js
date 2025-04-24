const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Mock login endpoint
router.post('/login', (req, res) => {
  const { role, userId, password } = req.body;

  // Basic validation
  if (!role || !userId) {
    return res.status(400).json({ error: 'Role and User ID are required' });
  }

  // In a real app, you would verify credentials against database
  const token = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  res.json({ token });
});

module.exports = router;