const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get faculty member details
router.get('/:facultyId', async (req, res) => {
    try {
        const { facultyId } = req.params;
        const query = `
            SELECT faculty_id, name, email, department
            FROM Faculty
            WHERE faculty_id = $1;
        `;
        const { rows } = await pool.query(query, [facultyId]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Faculty not found',
                message: 'No faculty member found with this ID'
            });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching faculty details:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch faculty details'
        });
    }
});

// Get faculty member's exam schedule
router.get('/:facultyId/exams', async (req, res) => {
    try {
        const { facultyId } = req.params;
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
                CASE 
                    WHEN r.room_no IS NOT NULL THEN r.building || ' ' || r.room_no
                    ELSE 'Not assigned'
                END AS location
            FROM Faculty f
            JOIN Allocation a ON f.faculty_id = a.faculty_id
            JOIN Exam e ON a.exam_id = e.exam_id
            LEFT JOIN Room r ON a.room_id = r.room_id
            WHERE f.faculty_id = $1
            ORDER BY e.date ASC, e.start_time ASC;
        `;
        
        const { rows } = await pool.query(query, [facultyId]);
        
        if (rows.length === 0) {
            return res.status(404).json({
                error: 'No exams found',
                message: 'No exams are assigned to this faculty member'
            });
        }
        
        res.json(rows);
    } catch (err) {
        console.error('Error fetching faculty exams:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch exam schedule'
        });
    }
});

module.exports = router; 