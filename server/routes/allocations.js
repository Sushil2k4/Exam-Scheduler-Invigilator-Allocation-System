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

// Assign teacher to exam and room
router.post('/assign', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { exam_id, available } = req.body;
    const faculty_id = req.user.id;

    if (!available) {
      await client.query(
        'DELETE FROM Allocation WHERE exam_id = $1 AND faculty_id = $2',
        [exam_id, faculty_id]
      );
      await client.query('COMMIT');
      return res.json({ success: true });
    }

    // Get exam details first
    const examQuery = `
      SELECT exam_id, date, start_time, end_time
      FROM Exam 
      WHERE exam_id = $1
    `;
    const examResult = await client.query(examQuery, [exam_id]);
    
    if (examResult.rows.length === 0) {
      throw new Error('Exam not found');
    }

    const exam = examResult.rows[0];

    // Find an available room that isn't already allocated for this time slot
    const roomQuery = `
      WITH ExistingAllocations AS (
        SELECT DISTINCT r.room_id, r.room_no, a.faculty_id, f.name as faculty_name, e.subject
        FROM Room r
        JOIN Allocation a ON r.room_id = a.room_id
        JOIN Exam e ON a.exam_id = e.exam_id
        JOIN Faculty f ON a.faculty_id = f.faculty_id
        WHERE e.date = $1 
        AND e.start_time = $2 
        AND e.end_time = $3
      )
      SELECT r.room_id, r.room_no
      FROM Room r
      WHERE r.capacity = 60
      AND r.room_id NOT IN (
        SELECT room_id FROM ExistingAllocations
      )
      ORDER BY r.room_no
      LIMIT 1
    `;
    
    const roomResult = await client.query(roomQuery, [exam.date, exam.start_time, exam.end_time]);
    
    if (roomResult.rows.length === 0) {
      throw new Error('No available rooms for this time slot - all rooms are already allocated');
    }

    const room = roomResult.rows[0];

    // Double check if room is truly available (prevent race conditions)
    const doubleCheckQuery = `
      SELECT f.name as faculty_name, e.subject
      FROM Allocation a
      JOIN Faculty f ON a.faculty_id = f.faculty_id
      JOIN Exam e ON a.exam_id = e.exam_id
      WHERE a.room_id = $1
      AND e.date = $2
      AND e.start_time = $3
      AND e.end_time = $4
    `;

    const doubleCheck = await client.query(doubleCheckQuery, [
      room.room_id,
      exam.date,
      exam.start_time,
      exam.end_time
    ]);

    if (doubleCheck.rows.length > 0) {
      throw new Error(`Room ${room.room_no} is already allocated to ${doubleCheck.rows[0].faculty_name} for ${doubleCheck.rows[0].subject}`);
    }

    // Create new allocation
    const timestamp = new Date().getTime();
    const allocationId = `AL${timestamp}${faculty_id}`;
    
    const allocationQuery = `
      INSERT INTO Allocation (allocation_id, exam_id, faculty_id, room_id)
      VALUES ($1, $2, $3, $4)
      RETURNING allocation_id
    `;
    
    await client.query(allocationQuery, [allocationId, exam_id, faculty_id, room.room_id]);
    
    await client.query('COMMIT');
    
    res.json({
      success: true,
      room_no: room.room_no
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in allocation:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;