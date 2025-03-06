-- Drop existing tables if they exist
DROP TABLE IF EXISTS Takes;
DROP TABLE IF EXISTS Invigilation;
DROP TABLE IF EXISTS Allocation;
DROP TABLE IF EXISTS TimeTable;
DROP TABLE IF EXISTS Exam;
DROP TABLE IF EXISTS Room;
DROP TABLE IF EXISTS Faculty;
DROP TABLE IF EXISTS Student;

-- Student Table
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
    room_id VARCHAR(50),
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE SET NULL
);

-- Time Table
CREATE TABLE TimeTable (
    timetable_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50),
    exam_id VARCHAR(50),
    room_id VARCHAR(50),
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE SET NULL
);

-- Allocation Table
CREATE TABLE Allocation (
    allocation_id VARCHAR(50) PRIMARY KEY,
    exam_id VARCHAR(50),
    room_id VARCHAR(50),
    faculty_id VARCHAR(50),
    semester INT CHECK (semester >= 1 AND semester <= 10),
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES Room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE
);

-- Invigilation Table (Many-to-Many between Faculty and Exam)
CREATE TABLE Invigilation (
    faculty_id VARCHAR(50),
    exam_id VARCHAR(50),
    PRIMARY KEY (faculty_id, exam_id),
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE
);

-- Takes Table (Many-to-Many between Student and Exam)
CREATE TABLE Takes (
    student_id VARCHAR(50),
    exam_id VARCHAR(50),
    PRIMARY KEY (student_id, exam_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES Exam(exam_id) ON DELETE CASCADE
);

-- Insert data into Student table
INSERT INTO Student (student_id, first_name, last_name, email, phone_number, department, academic_year, semester) VALUES
('RA2311003010369', 'Divyansh', 'Singh','dks@gmail.com', '1234567890', 'Computer Science', 1, 1),
('RA2311003010392', 'Spandan', 'Choubey', 'spdcb@gmail.com', '1234567891', 'Electrical Engineering', 2, 3),
('RA2311003010393', 'Sushil', 'Mishra', 'skm@gmail.com', '1234567892', 'Mechanical Engineering', 3, 5),
('RA2311003010406', 'Abhik', 'Raj', 'abkrj@gmail.com', '1234567893', 'Civil Engineering', 4, 7),
('RA2311003010426', 'Arnav', 'Prateek', 'ap@gmail.com', '1234567894', 'Chemical Engineering', 5, 9),
('RA2311003010427', 'Selvam', 'Furniturewala', 'slvfwl@gmail.com', '1234567895', 'Computer Science', 1, 2),
('RA2311003010436', 'Titas', 'Banerjee', 'ttsbnrj@gmail.com', '1234567896', 'Electrical Engineering', 2, 4),
('RA2311003010438', 'Nadeem', 'Shah', 'ndms@gmail.com', '1234567897', 'Mechanical Engineering', 3, 6),
('RA2311003010455', 'Gopal', 'Advani', 'gpladvn@gmail.com', '1234567898', 'Civil Engineering', 4, 8),
('RA2311003010459', 'Smruti', 'Parhi', 'smrprh  @gmail.com', '1234567899', 'Chemical Engineering', 5, 10);

-- Sample query to test the Student table
SELECT * FROM Student;

