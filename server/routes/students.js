const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get student's exam schedule by registration number
router.get('/:studentId/exams', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Validate student ID format
        if (!/^RA\d{12}$/.test(studentId)) {
            return res.status(400).json({ 
                error: 'Invalid registration number format',
                example: 'RA2311003010383' 
            });
        }

        const query = `
            SELECT 
                e.exam_id,
                e.subject,
                e.date,
                TO_CHAR(e.date, 'FMDay, DD Month YYYY') as formatted_date,
                e.start_time,
                e.end_time,
                e.start_time || ' - ' || e.end_time AS time_slot,
                e.semester,
                r.building,
                r.room_no,
                COALESCE(r.building || ' Room ' || r.room_no, 'Not assigned') AS location,
                f.name AS invigilator,
                s.department
            FROM Student s
            JOIN TimeTable tt ON s.student_id = tt.student_id
            JOIN Exam e ON tt.exam_id = e.exam_id
            LEFT JOIN Room r ON tt.room_id = r.room_id
            LEFT JOIN Allocation a ON e.exam_id = a.exam_id
            LEFT JOIN Faculty f ON a.faculty_id = f.faculty_id
            WHERE s.student_id = $1
            ORDER BY e.date ASC, e.start_time ASC;
        `;

        const { rows } = await pool.query(query, [studentId]);

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'No exams found',
                message: 'No exams are scheduled for this registration number'
            });
        }

        // Format the response
        const response = {
            student_id: studentId,
            department: rows[0].department,
            exams: rows.map(exam => ({
                exam_id: exam.exam_id,
                subject: exam.subject,
                formatted_date: exam.formatted_date,
                time_slot: exam.time_slot,
                location: exam.location,
                invigilator: exam.invigilator || 'Not assigned',
                semester: exam.semester
            }))
        };

        res.json(response);

    } catch (err) {
        console.error('Error fetching student exams:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch exam schedule. Please try again later.'
        });
    }
});

// Get student's exams
router.get('/exams', async (req, res) => {
  try {
    const studentId = req.user.id; // Get student ID from authenticated user

    const query = `
      SELECT e.exam_id, e.subject, e.date, e.start_time, e.end_time, 
             e.semester, e.department, r.room_no, r.building
      FROM Exam e
      JOIN Takes t ON e.exam_id = t.exam_id
      LEFT JOIN Room r ON e.room_id = r.room_id
      WHERE t.student_id = $1
      ORDER BY e.date, e.start_time
    `;

    const { rows } = await pool.query(query, [studentId]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching student exams:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;