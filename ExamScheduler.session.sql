3-- Student Table
CREATE TABLE Student (
    student_id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    academic_year INT CHECK (academic_year >= 1 AND academic_year <= 5),
    semester INT CHECK (semester >= 1 AND semester <= 10)
);

-- Faculty Table
CREATE TABLE Faculty (
    faculty_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    availability_status BOOLEAN DEFAULT TRUE
);

-- Room Table
CREATE TABLE Room (
    room_id VARCHAR(50) PRIMARY KEY,
    room_no VARCHAR(10) UNIQUE NOT NULL,
    building VARCHAR(50) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    capacity INT CHECK (capacity > 0)
);

-- Exam Table
CREATE TABLE Exam (
    exam_id VARCHAR(50) PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    semester INT CHECK (semester >= 1 AND semester <= 10),
    department VARCHAR(100) NOT NULL,
    room_id VARCHAR(50) REFERENCES Room(room_id) ON DELETE SET NULL
);

-- Time Table
CREATE TABLE TimeTable (
    timetable_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) REFERENCES Student(student_id) ON DELETE CASCADE,
    exam_id VARCHAR(50) REFERENCES Exam(exam_id) ON DELETE CASCADE,
    room_id VARCHAR(50) REFERENCES Room(room_id) ON DELETE SET NULL
);

-- Allocation Table
CREATE TABLE Allocation (
    allocation_id VARCHAR(50) PRIMARY KEY,
    exam_id VARCHAR(50) REFERENCES Exam(exam_id) ON DELETE CASCADE,
    room_id VARCHAR(50) REFERENCES Room(room_id) ON DELETE CASCADE,
    faculty_id VARCHAR(50) REFERENCES Faculty(faculty_id) ON DELETE CASCADE,
    semester INT CHECK (semester >= 1 AND semester <= 10)
);

-- Invigilation Table (Many-to-Many between Faculty and Exam)
CREATE TABLE Invigilation (
    faculty_id VARCHAR(50) REFERENCES Faculty(faculty_id) ON DELETE CASCADE,
    exam_id VARCHAR(50) REFERENCES Exam(exam_id) ON DELETE CASCADE,
    PRIMARY KEY (faculty_id, exam_id)
);

-- Takes Table (Many-to-Many between Student and Exam)
CREATE TABLE Takes (
    student_id VARCHAR(50) REFERENCES Student(student_id) ON DELETE CASCADE,
    exam_id VARCHAR(50) REFERENCES Exam(exam_id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, exam_id)
);

SELECT * FROM Student;