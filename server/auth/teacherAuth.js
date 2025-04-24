const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Common password for all teachers
const TEACHER_PASSWORD = 'teacher@123';

const login = async (facultyId, password) => {
  try {
    // Verify teacher exists
    const { rows } = await pool.query(
      'SELECT faculty_id, name FROM Faculty WHERE faculty_id = $1',
      [facultyId]
    );

    if (rows.length === 0) {
      throw new Error('Invalid faculty ID');
    }

    // Verify password
    if (password !== TEACHER_PASSWORD) {
      throw new Error('Invalid password');
    }

    const teacher = rows[0];
    
    // Generate token
    const token = jwt.sign(
      { id: teacher.faculty_id, role: 'teacher' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return {
      token,
      user: {
        id: teacher.faculty_id,
        name: teacher.name,
        role: 'teacher'
      }
    };
  } catch (err) {
    console.error('Teacher login error:', err);
    throw err;
  }
};

module.exports = { login };
