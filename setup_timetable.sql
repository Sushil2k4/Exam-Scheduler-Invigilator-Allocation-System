-- First, let's make sure we have the TimeTable entries for students
INSERT INTO TimeTable (timetable_id, student_id, exam_id, room_id)
VALUES
-- For student RA2311003010393 (Sushil Mishra)
('TT001', 'RA2311003010393', '20250529_10_3_3', 'TP601'), -- Operating Systems
('TT002', 'RA2311003010393', '20250603_10_3_1', 'TP602'), -- Data Structures and Algorithms
('TT003', 'RA2311003010393', '20250531_14_5_1', 'TP603'), -- Formal Language and Automata
('TT004', 'RA2311003010393', '20250530_10_5_2', 'TP604'), -- Computer Networks

-- For student RA2311003010426 (Arnav Prateek)
('TT005', 'RA2311003010426', '20250529_10_3_3', 'TP601'), -- Operating Systems
('TT006', 'RA2311003010426', '20250603_10_3_1', 'TP602'), -- Data Structures and Algorithms
('TT007', 'RA2311003010426', '20250531_14_5_1', 'TP603'), -- Formal Language and Automata
('TT008', 'RA2311003010426', '20250530_10_5_2', 'TP604'); -- Computer Networks

-- Make sure we have room assignments
INSERT INTO Room (room_id, room_no, building, room_type, capacity)
VALUES 
('TP601', '601', 'Tech Park', 'Classroom', 60),
('TP602', '602', 'Tech Park', 'Classroom', 60),
('TP603', '603', 'Tech Park', 'Classroom', 60),
('TP604', '604', 'Tech Park', 'Classroom', 60)
ON CONFLICT (room_id) DO NOTHING;

-- Add faculty for invigilation
INSERT INTO Faculty (faculty_id, name, email, phone_number, department, availability_status)
VALUES 
(1, 'Dr. Rajesh Kumar', 'rajesh.kumar@srmist.edu.in', '9876543210', 'Computing Technologies', true),
(2, 'Dr. Priya Sharma', 'priya.sharma@srmist.edu.in', '9876543211', 'Computing Technologies', true),
(3, 'Dr. Amit Verma', 'amit.verma@srmist.edu.in', '9876543212', 'Computing Technologies', true),
(4, 'Dr. Sneha Patel', 'sneha.patel@srmist.edu.in', '9876543213', 'Computing Technologies', true)
ON CONFLICT (faculty_id) DO NOTHING;

-- Assign faculty to exams
INSERT INTO Allocation (allocation_id, exam_id, room_id, faculty_id, semester)
VALUES
('AL001', '20250529_10_3_3', 'TP601', 1, 3),
('AL002', '20250603_10_3_1', 'TP602', 2, 3),
('AL003', '20250531_14_5_1', 'TP603', 3, 5),
('AL004', '20250530_10_5_2', 'TP604', 4, 5)
ON CONFLICT (allocation_id) DO NOTHING;

-- Verify the data
SELECT 
    s.student_id,
    s.first_name || ' ' || s.last_name AS student_name,
    e.subject,
    e.date,
    e.start_time,
    e.end_time,
    r.building || ' ' || r.room_no AS location,
    f.name AS invigilator
FROM Student s
JOIN TimeTable tt ON s.student_id = tt.student_id
JOIN Exam e ON tt.exam_id = e.exam_id
JOIN Room r ON tt.room_id = r.room_id
JOIN Allocation a ON e.exam_id = a.exam_id
JOIN Faculty f ON a.faculty_id = f.faculty_id
WHERE s.student_id IN ('RA2311003010393', 'RA2311003010426')
ORDER BY s.student_id, e.date, e.start_time; 