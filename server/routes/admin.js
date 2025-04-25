const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateAdmin, login } = require('../auth/adminAuth');

// Admin login route
router.post('/login', login);

// Protected routes - require admin authentication
router.use(authenticateAdmin);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM Student) as total_students,
                (SELECT COUNT(*) FROM Faculty) as total_faculty,
                (SELECT COUNT(*) FROM Exam WHERE date >= CURRENT_DATE) as total_exams,
                (SELECT COUNT(*) FROM Room) as available_rooms
        `);

        const recentAllocations = await pool.query(`
            SELECT 
                e.exam_id,
                e.date,
                e.subject,
                e.start_time,
                e.end_time,
                f.name as faculty_name,
                r.room_no,
                r.building,
                CASE 
                    WHEN f.faculty_id IS NOT NULL AND r.room_id IS NOT NULL THEN 'Active'
                    ELSE 'Pending'
                END as status
            FROM Exam e
            LEFT JOIN Allocation a ON e.exam_id = a.exam_id
            LEFT JOIN Faculty f ON a.faculty_id = f.faculty_id
            LEFT JOIN Room r ON a.room_id = r.room_id
            WHERE e.date >= CURRENT_DATE
            ORDER BY e.date ASC, e.start_time ASC
            LIMIT 10
        `);

        res.json({
            statistics: stats.rows[0],
            recentAllocations: recentAllocations.rows
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all students
router.get('/students', async (req, res) => {
    try {
        const query = `
            SELECT 
                student_id,
                CONCAT(first_name, ' ', last_name) as name,
                email,
                phone_number as phone,
                department
            FROM Student
            ORDER BY student_id;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all faculty
router.get('/faculty', async (req, res) => {
    try {
        const query = `
            SELECT 
                f.faculty_id,
                f.name,
                f.email,
                f.department,
                NOT EXISTS (
                    SELECT 1 FROM Allocation a 
                    JOIN Exam e ON a.exam_id = e.exam_id
                    WHERE a.faculty_id = f.faculty_id 
                    AND e.date = CURRENT_DATE 
                    AND CURRENT_TIME BETWEEN e.start_time AND e.end_time
                ) as is_available
            FROM Faculty f
            ORDER BY f.name;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching faculty:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all exams
router.get('/exams', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.exam_id,
                e.subject,
                e.date,
                e.start_time,
                e.end_time,
                e.semester,
                EXISTS (
                    SELECT 1 FROM Allocation a 
                    WHERE a.exam_id = e.exam_id
                ) as is_allocated
            FROM Exam e
            ORDER BY e.date, e.start_time;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching exams:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all rooms
router.get('/rooms', async (req, res) => {
    try {
        const query = `
            SELECT 
                r.room_id,
                r.room_no,
                r.building,
                r.capacity,
                NOT EXISTS (
                    SELECT 1 FROM Allocation a 
                    JOIN Exam e ON a.exam_id = e.exam_id
                    WHERE a.room_id = r.room_id 
                    AND e.date = CURRENT_DATE 
                    AND CURRENT_TIME BETWEEN e.start_time AND e.end_time
                ) as is_available
            FROM Room r
            ORDER BY r.building, r.room_no;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all allocations
router.get('/allocations', async (req, res) => {
    try {
        const query = `
            SELECT 
                e.subject,
                r.building,
                r.room_no,
                f.name as faculty_name,
                e.date,
                e.start_time,
                e.end_time
            FROM Allocation a
            JOIN Exam e ON a.exam_id = e.exam_id
            JOIN Room r ON a.room_id = r.room_id
            JOIN Faculty f ON a.faculty_id = f.faculty_id
            ORDER BY e.date, e.start_time;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching allocations:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new student
router.post('/students', async (req, res) => {
    const { name, email, department } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO student (name, email, department) VALUES ($1, $2, $3) RETURNING *',
            [name, email, department]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new faculty
router.post('/faculty', async (req, res) => {
    const { name, email, department } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO faculty (name, email, department) VALUES ($1, $2, $3) RETURNING *',
            [name, email, department]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding faculty:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new exam
router.post('/exams', async (req, res) => {
    const { subject, date, time } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO exam (subject, date, time) VALUES ($1, $2, $3) RETURNING *',
            [subject, date, time]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding exam:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add new room
router.post('/rooms', async (req, res) => {
    const { room_number, building, capacity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO room (room_number, building, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [room_number, building, capacity, 'available']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update student
router.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, department } = req.body;
    try {
        const result = await pool.query(
            'UPDATE student SET name = $1, email = $2, department = $3 WHERE id = $4 RETURNING *',
            [name, email, department, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update faculty
router.put('/faculty/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, department } = req.body;
    try {
        const result = await pool.query(
            'UPDATE faculty SET name = $1, email = $2, department = $3 WHERE id = $4 RETURNING *',
            [name, email, department, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating faculty:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update exam
router.put('/exams/:id', async (req, res) => {
    const { id } = req.params;
    const { subject, date, time } = req.body;
    try {
        const result = await pool.query(
            'UPDATE exam SET subject = $1, date = $2, time = $3 WHERE id = $4 RETURNING *',
            [subject, date, time, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update room
router.put('/rooms/:id', async (req, res) => {
    const { id } = req.params;
    const { room_number, building, capacity, status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE room SET room_number = $1, building = $2, capacity = $3, status = $4 WHERE id = $5 RETURNING *',
            [room_number, building, capacity, status, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete student
router.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM student WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete faculty
router.delete('/faculty/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM faculty WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Faculty not found' });
        }
        res.json({ message: 'Faculty deleted successfully' });
    } catch (error) {
        console.error('Error deleting faculty:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete exam
router.delete('/exams/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM exam WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exam not found' });
        }
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete room
router.delete('/rooms/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM room WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 