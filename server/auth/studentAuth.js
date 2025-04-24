const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Common password for all students
const STUDENT_PASSWORD = 'student@123';

const login = async (studentId, password) => {
  try {
    // Verify student exists
    const { rows } = await pool.query(
      'SELECT student_id, first_name, last_name FROM Student WHERE student_id = $1',
      [studentId]
    );

    if (rows.length === 0) {
      throw new Error('Invalid student ID');
    }

    // Verify password
    if (password !== STUDENT_PASSWORD) {
      throw new Error('Invalid password');
    }

    const student = rows[0];
    
    // Generate token
    const token = jwt.sign(
      { id: student.student_id, role: 'student' },
      process.env.JWT_SECRET || 'development_secret',
      { expiresIn: '1h' }
    );

    return {
      token,
      user: {
        id: student.student_id,
        name: `${student.first_name} ${student.last_name}`,
        role: 'student'
      }
    };
  } catch (err) {
    console.error('Student login error:', err);
    throw err;
  }
};

module.exports = { login };