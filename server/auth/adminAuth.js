const jwt = require('jsonwebtoken');
const pool = require('../db');

// Admin credentials (in production, store hashed password in environment variables)
const ADMIN_CREDENTIALS = {
  id: 'admin',
  password: 'ESIAS@2023' // Change this in production!
};

const ADMIN_PASSWORD = 'admin@123';

const login = (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username is 'admin' and password matches
    if (username === 'admin' && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        { username: 'admin', role: 'admin' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ 
        token,
        user: {
          username: 'admin',
          role: 'admin'
        },
        redirectUrl: '/admin-dashboard.html'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Error authenticating admin:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = {
  login,
  authenticateAdmin
};