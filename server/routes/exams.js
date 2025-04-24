const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all exams with filtering
router.get('/', async (req, res) => {
  try {
    const { department, date } = req.query;
    
    let query = `
      SELECT 
        e.exam_id,
        e.subject,
        e.date,
        e.start_time,
        e.end_time,
        e.semester,
        e.department,
        r.room_no,
        r.building
      FROM Exam e
      LEFT JOIN Room r ON e.room_id = r.room_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (department) {
      conditions.push(`e.department = $${params.length + 1}`);
      params.push(department);
    }
    
    if (date) {
      conditions.push(`e.date = $${params.length + 1}`);
      params.push(date);
    }
    
    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    query += ' ORDER BY e.date, e.start_time';
    
    const { rows } = await pool.query(query, params);
    
    // Format dates for frontend
    const formattedExams = rows.map(exam => ({
      ...exam,
      date: new Date(exam.date).toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: `${exam.start_time} - ${exam.end_time}`,
      location: exam.room_no ? `${exam.building} ${exam.room_no}` : 'Not assigned'
    }));
    
    res.json(formattedExams);
  } catch (err) {
    console.error('Exam fetch error:', err);
    res.status(500).json({ 
      error: 'Failed to fetch exams',
      details: err.message 
    });
  }
});

// Create new exam
router.post('/', async (req, res) => {
  try {
    const { subject, date, start_time, end_time, semester, department } = req.body;
    
    if (!subject || !date || !start_time || !end_time || !semester || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const { rows } = await pool.query(`
      INSERT INTO Exam (
        exam_id, 
        subject, 
        date, 
        start_time, 
        end_time, 
        semester, 
        department
      ) VALUES (
        uuid_generate_v4(), 
        $1, $2, $3, $4, $5, $6
      ) RETURNING *
    `, [subject, date, start_time, end_time, semester, department]);
    
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Exam creation error:', err);
    res.status(500).json({ 
      error: 'Failed to create exam',
      details: err.message 
    });
  }
});

module.exports = router;