require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const pool = require('./db');

// Route imports
const studentRoutes = require('./routes/students');
const examRoutes = require('./routes/exams');
const allocationRoutes = require('./routes/allocations');
const { login: studentLogin } = require('./auth/studentAuth');
const { login: teacherLogin } = require('./auth/teacherAuth');
const adminRoutes = require('./routes/admin');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Public route for exam schedule lookup
app.get('/api/students/:studentId/exams', async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log('Received request for student ID:', studentId);

        // First, check if the student exists
        try {
            const studentQuery = 'SELECT student_id, department FROM Student WHERE student_id = $1';
            console.log('Executing student query:', studentQuery, 'with ID:', studentId);
            const studentResult = await pool.query(studentQuery, [studentId]);
            console.log('Student query result:', studentResult.rows);

            if (studentResult.rows.length === 0) {
                console.log('No student found with ID:', studentId);
                return res.status(404).json({
                    error: 'Student not found',
                    message: 'No student found with this registration number'
                });
            }

            // Now get the exams
            const examQuery = `
                SELECT DISTINCT ON (e.exam_id)
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
                    COALESCE(f.name, 'Not assigned') AS invigilator,
                    s.department
                FROM Student s
                JOIN TimeTable tt ON s.student_id = tt.student_id
                JOIN Exam e ON tt.exam_id = e.exam_id
                LEFT JOIN Room r ON tt.room_id = r.room_id
                LEFT JOIN Allocation a ON e.exam_id = a.exam_id
                LEFT JOIN Faculty f ON a.faculty_id = f.faculty_id
                WHERE s.student_id = $1
                ORDER BY e.exam_id, e.date ASC, e.start_time ASC;
            `;

            console.log('Executing exam query for student:', studentId);
            const { rows } = await pool.query(examQuery, [studentId]);
            console.log('Found', rows.length, 'exams for student:', studentId);

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
                    location: exam.location || 'Not assigned',
                    invigilator: exam.invigilator || 'Not assigned',
                    semester: exam.semester
                }))
            };

            console.log('Sending response for student:', studentId);
            res.json(response);

        } catch (dbError) {
            console.error('Database error:', dbError);
            throw new Error('Database error: ' + dbError.message);
        }

    } catch (err) {
        console.error('Error in exam lookup:', err);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch exam schedule. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// Login Endpoints
app.post('/api/auth/student/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    
    if (!studentId || !password) {
      return res.status(400).json({ error: 'Student ID and password are required' });
    }

    const result = await studentLogin(studentId, password);
    res.json(result);
  } catch (err) {
    console.error('Student login error:', err);
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

app.post('/api/auth/teacher/login', async (req, res) => {
  try {
    const { facultyId, password } = req.body;
    
    if (!facultyId || !password) {
      return res.status(400).json({ error: 'Faculty ID and password are required' });
    }

    const result = await teacherLogin(facultyId, password);
    res.json(result);
  } catch (err) {
    console.error('Teacher login error:', err);
    res.status(401).json({ error: err.message || 'Invalid credentials' });
  }
});

// Admin login (if needed)
app.post('/api/auth/admin/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin@123') {
    const token = jwt.sign(
      { id: 'admin', role: 'admin' },
      process.env.JWT_SECRET || 'development_secret',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: 'admin',
        name: 'Administrator',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// Protected Routes
app.use('/api/students', authenticate, studentRoutes);
app.use('/api/exams', authenticate, examRoutes);
app.use('/api/allocations', authenticate, allocationRoutes);

// User details endpoints
app.get('/api/students/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('Fetching details for student:', studentId);

    // Using first_name and last_name as shown in the table structure
    const query = `
      SELECT 
        student_id,
        first_name || ' ' || last_name AS name,
        department
      FROM Student 
      WHERE student_id = $1
    `;
    console.log('Executing query:', query);
    
    const result = await pool.query(query, [studentId]);
    console.log('Query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No student found with ID:', studentId);
      return res.status(404).json({ error: 'Student not found' });
    }

    // Log the response being sent
    console.log('Sending student data:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch student details',
      details: error.message 
    });
  }
});

app.get('/api/teachers/:facultyId', async (req, res) => {
  try {
    const { facultyId } = req.params;
    const result = await pool.query(
      'SELECT faculty_id, name, department FROM Faculty WHERE faculty_id = $1',
      [facultyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching faculty details:', error);
    res.status(500).json({ error: 'Failed to fetch faculty details' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Statistics endpoints
app.get('/api/statistics/students', async (req, res) => {
    try {
        const result = await pool.query('SELECT COUNT(*) as count FROM Student');
        res.json({ count: result.rows[0].count });
    } catch (error) {
        console.error('Error getting student count:', error);
        res.status(500).json({ error: 'Failed to get student count' });
    }
});

app.get('/api/statistics/upcoming-exams', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM Exam 
            WHERE date >= CURRENT_DATE
        `);
        res.json({ count: result.rows[0].count });
    } catch (error) {
        console.error('Error getting upcoming exams count:', error);
        res.status(500).json({ error: 'Failed to get upcoming exams count' });
    }
});

app.get('/api/statistics/pending-allocations', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) as count 
            FROM Exam e 
            LEFT JOIN Allocation a ON e.exam_id = a.exam_id 
            WHERE a.faculty_id IS NULL AND e.date >= CURRENT_DATE
        `);
        res.json({ count: result.rows[0].count });
    } catch (error) {
        console.error('Error getting pending allocations count:', error);
        res.status(500).json({ error: 'Failed to get pending allocations count' });
    }
});

// Add admin routes
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server with port conflict handling
const startServer = (port) => {
  try {
    const server = app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log('Available endpoints:');
      console.log(`- POST http://localhost:${port}/api/auth/student/login`);
      console.log(`- POST http://localhost:${port}/api/auth/teacher/login`);
      console.log(`- POST http://localhost:${port}/api/auth/admin/login`);
      console.log(`- GET  http://localhost:${port}/api/students`);
      console.log(`- GET  http://localhost:${port}/api/exams`);
      console.log(`- GET  http://localhost:${port}/api/allocations`);
      console.log(`- GET  http://localhost:${port}/api/health`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is already in use, trying port ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer(PORT);

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.get('/api/exams/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    console.log('Received request for student ID:', studentId);

    try {
        // First check if student exists
        const studentQuery = `
            SELECT student_id, department 
            FROM Student 
            WHERE student_id = $1
        `;
        console.log('Executing student query:', studentQuery, 'with ID:', studentId);
        const studentResult = await pool.query(studentQuery, [studentId]);
        console.log('Student query result:', studentResult.rows);

        if (studentResult.rows.length === 0) {
            console.log('No student found with ID:', studentId);
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get exam schedule for the student
        const examQuery = `
            SELECT 
                s.student_id,
                s.department,
                e.exam_id,
                e.subject,
                e.date,
                e.start_time,
                e.end_time,
                r.building,
                r.room_no
            FROM Student s
            JOIN TimeTable t ON s.student_id = t.student_id
            JOIN Exam e ON t.exam_id = e.exam_id
            LEFT JOIN Room r ON t.room_id = r.room_id
            WHERE s.student_id = $1
            ORDER BY e.date, e.start_time
        `;
        
        console.log('Executing exam query for student:', studentId);
        const examResult = await pool.query(examQuery, [studentId]);
        console.log('Found', examResult.rows.length, 'exams for student:', studentId);

        if (examResult.rows.length === 0) {
            return res.status(404).json({ error: 'No exam schedule found for this student' });
        }

        res.json(examResult.rows);
    } catch (err) {
        console.error('Error fetching exam schedule:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});