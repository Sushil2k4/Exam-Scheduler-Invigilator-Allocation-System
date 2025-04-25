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
                (SELECT COUNT(*) FROM student) as total_students,
                (SELECT COUNT(*) FROM faculty) as total_faculty,
                (SELECT COUNT(*) FROM exam) as total_exams,
                (SELECT COUNT(*) FROM room) as available_rooms
        `);

        const recentAllocations = await pool.query(`
            SELECT a.id, e.subject, f.name as faculty_name, r.room_no, e.date, e.time
            FROM allocation a
            JOIN exam e ON a.exam_id = e.exam_id
            JOIN faculty f ON a.faculty_id = f.faculty_id
            JOIN room r ON a.room_id = r.room_id
            ORDER BY e.date DESC, e.time DESC
            LIMIT 5
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
        const result = await pool.query('SELECT * FROM student ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all faculty
router.get('/faculty', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM faculty ORDER BY name');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching faculty:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all exams
router.get('/exams', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, r.room_number, f.name as faculty_name
            FROM exam e
            LEFT JOIN allocation a ON e.id = a.exam_id
            LEFT JOIN room r ON a.room_id = r.id
            LEFT JOIN faculty f ON a.faculty_id = f.id
            ORDER BY e.date, e.time
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching exams:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all rooms
router.get('/rooms', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM room ORDER BY room_number');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rooms:', error);
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