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

-- Insert data into Faculty table
INSERT INTO Faculty (faculty_id, name, email, phone_number, department, availability_status) VALUES
('RA2311003010FA001', 'Dr. D Viji', 'vijid@srmist.edu.in', '9876543210', 'Computer Science', TRUE),
('RA2311003010FA002', 'Dr. Mahendran K', 'mahik@srmist.edu.in', '9876543211', 'Electrical Engineering', TRUE),
('RA2311003010FA003', 'Dr. Sudestna Pathak', 'sudhp@srmist.edu.in', '9876543212', 'Mechanical Engineering', TRUE),
('RA2311003010FA004', 'Dr. Sindhuja M', 'sidhum@srmist.edu.in', '9876543213', 'Civil Engineering', TRUE),
('RA2311003010FA005', 'Dr. Ramaprabha J', 'ramuj@srmist.edu.in', '9876543214', 'Chemical Engineering', TRUE),
('RA2311003010FA006', 'Dr. Vivek Justus', 'vivuj@srmist.edu.in', '9876543215', 'Computer Science', TRUE),
('RA2311003010FA007', 'Dr. Deepa R', 'deepuR@srmist.edu.in', '9876543216', 'Electrical Engineering', TRUE),
('RA2311003010FA008', 'Dr. Dhanavati G', 'dhanuG@srmist.edu.in', '9876543217', 'Mechanical Engineering', TRUE),
('RA2311003010FA009', 'Dr. Senthil Kumar', 'sentK@srmist.edu.in', '9876543218', 'Civil Engineering', TRUE),
('RA2311003010FA010', 'Dr. Geeta G ', 'gg@srmist.edu.in', '9876543219', 'Chemical Engineering', TRUE);

INSERT INTO room VALUES
('1','101','Tech Park','Class',60),
('2','102','Tech Park','Class',60),
('3','103','Tech Park','Class',60),
('4','105','Tech Park','Class',60),
('5','201','Tech Park','Class',60),
('6','202','Tech Park','Class',60),
('7','203','Tech Park','Class',60),
('8','204','Tech Park','Class',60),
('9','205','Tech Park','Class',60),
('10','206','Tech Park','Class',60);

INSERT INTO exam (exam_id, subject, date, start_time, end_time, semester, department, room_id) VALUES
('21CSC204J','Data Structures and Algorithms','2021-12-01','09:00:00','12:00:00',2,'Computer Science','1'),
('21CSC205J','Operating Systems','2021-12-02','09:00:00','12:00:00',2,'Computer Science','2'),
('21CSC206J','Computer Networks','2021-12-03','09:00:00','12:00:00',2,'Computer Science','3'),
('21CSC207J','Database Management Systems','2021-12-04','13:00:00','16:00:00',2,'Computer Science','4'),
('21CSC208J','Software Engineering','2021-12-05','13:00:00','16:00:00',2,'Computer Science','5'),
('21ELE204J','Electrical Machines','2021-12-06','09:00:00','12:00:00',2,'Electrical Engineering','6'),
('21ELE205J','Power Systems','2021-12-07','09:00:00','12:00:00',2,'Electrical Engineering','7'),
('21ELE206J','Control Systems','2021-12-08','09:00:00','12:00:00',2,'Electrical Engineering','8'),
('21ELE207J','Digital Electronics','2021-12-09','09:00:00','12:00:00',2,'Electrical Engineering','9'),
('21ELE208J','Microprocessors','2021-12-10','09:00:00','12:00:00',2,'Electrical Engineering','10');

INSERT INTO timeTable (timetable_id, student_id, exam_id, room_id) VALUES
('1','RA2311003010369','21CSC204J','1'),
('2','RA2311003010369','21CSC205J','2'),
('3','RA2311003010369','21CSC206J','3'),
('4','RA2311003010369','21CSC207J','4'),
('5','RA2311003010369','21CSC208J','5'),
('6','RA2311003010392','21ELE204J','6'),
('7','RA2311003010392','21ELE205J','7'),
('8','RA2311003010392','21ELE206J','8'),
('9','RA2311003010392','21ELE207J','9'),
('10','RA2311003010392','21ELE208J','10');

INSERT INTO allocation VALUES
('1','21CSC204J','1','RA2311003010FA001',2),
('2','21CSC205J','2','RA2311003010FA002',2),
('3','21CSC206J','3','RA2311003010FA003',2),
('4','21CSC207J','4','RA2311003010FA004',2),
('5','21CSC208J','5','RA2311003010FA005',2),
('6','21ELE204J','6','RA2311003010FA006',2),
('7','21ELE205J','7','RA2311003010FA007',2),
('8','21ELE206J','8','RA2311003010FA008',2),
('9','21ELE207J','9','RA2311003010FA009',2),
('10','21ELE208J','10','RA2311003010FA010',2);

-- Sample query to test the Student table
SELECT * FROM Student;
SELECT * FROM Faculty;
SELECT * FROM room;
SELECT * FROM exam;
SELECT * FROM timetable;
SELECT * FROM allocation;
