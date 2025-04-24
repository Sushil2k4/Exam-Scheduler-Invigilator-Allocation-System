const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // In a real system, you would verify password here
    // For demo, we'll just check the ID exists
    const student = rows[0];
    
    // Generate token
    const token = jwt.sign(
      { id: student.student_id, role: 'student' },
      process.env.JWT_SECRET,
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