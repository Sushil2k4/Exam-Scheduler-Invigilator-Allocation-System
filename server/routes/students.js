const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all students
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        student_id, 
        first_name, 
        last_name, 
        email, 
        phone_number, 
        department, 
        academic_year, 
        semester 
      FROM Student 
      ORDER BY first_name, last_name
    `);
    
    // Format response to match frontend expectations
    const formattedStudents = rows.map(student => ({
      student_id: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      email: student.email,
      phone: student.phone_number,
      department: student.department,
      year: student.academic_year,
      semester: student.semester
    }));

    res.json(formattedStudents);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch students',
      details: err.message 
    });
  }
});

module.exports = router;