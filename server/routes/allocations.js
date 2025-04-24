const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all allocations with filters
router.get('/', async (req, res) => {
  try {
    const { faculty, exam } = req.query;
    
    let query = `
      SELECT 
        a.allocation_id,
        e.subject,
        e.date,
        f.name AS faculty_name,
        r.room_no
      FROM Allocation a
      JOIN Exam e ON a.exam_id = e.exam_id
      JOIN Faculty f ON a.faculty_id = f.faculty_id
      LEFT JOIN Room r ON a.room_id = r.room_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (faculty) {
      conditions.push(`a.faculty_id = $${params.length + 1}`);
      params.push(faculty);
    }
    
    if (exam) {
      conditions.push(`a.exam_id = $${params.length + 1}`);
      params.push(exam);
    }
    
    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY e.date, e.start_time';
    
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to fetch allocations' });
  }
});

module.exports = router;