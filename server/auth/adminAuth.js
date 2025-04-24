const jwt = require('jsonwebtoken');

// Admin credentials (in production, store hashed password in environment variables)
const ADMIN_CREDENTIALS = {
  id: 'admin',
  password: 'ESIAS@2023' // Change this in production!
};

const login = (adminId, password) => {
  try {
    if (adminId !== ADMIN_CREDENTIALS.id || password !== ADMIN_CREDENTIALS.password) {
      throw new Error('Invalid admin credentials');
    }

    const token = jwt.sign(
      { id: adminId, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      token,
      user: {
        id: adminId,
        name: 'System Administrator',
        role: 'admin'
      }
    };
  } catch (err) {
    console.error('Admin login error:', err);
    throw err;
  }
};

module.exports = { login };