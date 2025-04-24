-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS Student (
    student_id VARCHAR(15) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    department VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    password VARCHAR(100) NOT NULL DEFAULT 'student@123'
);

-- Insert test student data
INSERT INTO Student (student_id, first_name, last_name, email, phone_number, department, semester) 
VALUES 
    ('RA2311003010393', 'Sushil', 'Mishra', 'sushil.mishra@srmist.edu.in', '9876543210', 'Computing Technologies', 1),
    ('RA2311003010426', 'Test', 'Student', 'test.student@srmist.edu.in', '9876543211', 'Computing Technologies', 1)
ON CONFLICT (student_id) DO UPDATE 
SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone_number = EXCLUDED.phone_number,
    department = EXCLUDED.department,
    semester = EXCLUDED.semester;

-- Create other necessary tables
CREATE TABLE IF NOT EXISTS Faculty (
    faculty_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    department VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL DEFAULT 'teacher@123'
);

-- Insert test faculty data
INSERT INTO Faculty (faculty_id, first_name, last_name, email, phone_number, department) 
VALUES 
    ('FAC001', 'Rajesh', 'Kumar', 'rajesh.kumar@srmist.edu.in', '9876540001', 'Computing Technologies'),
    ('FAC002', 'Priya', 'Sharma', 'priya.sharma@srmist.edu.in', '9876540002', 'Computing Technologies'),
    ('FAC003', 'Suresh', 'Patel', 'suresh.patel@srmist.edu.in', '9876540003', 'Computing Technologies'),
    ('FAC004', 'Meera', 'Singh', 'meera.singh@srmist.edu.in', '9876540004', 'Computing Technologies'),
    ('FAC005', 'Anil', 'Verma', 'anil.verma@srmist.edu.in', '9876540005', 'Computing Technologies')
ON CONFLICT (faculty_id) DO UPDATE 
SET 
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone_number = EXCLUDED.phone_number,
    department = EXCLUDED.department;

CREATE TABLE IF NOT EXISTS Exam (
    exam_id SERIAL PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    semester INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Room (
    room_id SERIAL PRIMARY KEY,
    building VARCHAR(50) NOT NULL,
    room_no VARCHAR(10) NOT NULL,
    capacity INT NOT NULL
);

CREATE TABLE IF NOT EXISTS TimeTable (
    timetable_id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES Exam(exam_id),
    student_id VARCHAR(15) REFERENCES Student(student_id),
    room_id INT REFERENCES Room(room_id)
);

CREATE TABLE IF NOT EXISTS Allocation (
    allocation_id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES Exam(exam_id),
    faculty_id VARCHAR(10) REFERENCES Faculty(faculty_id),
    room_id INT REFERENCES Room(room_id)
); 