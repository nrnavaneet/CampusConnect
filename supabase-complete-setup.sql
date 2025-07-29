
-- Complete Supabase Setup for Campus Placement Portal
-- This script drops everything and creates a fresh database
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop all existing tables, types, and functions if they exist
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS grievances CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS student_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS grievance_status CASCADE;
DROP TYPE IF EXISTS grievance_priority CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS application_stats CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_details table
CREATE TABLE student_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    gender TEXT NOT NULL,
    college_reg_no TEXT UNIQUE NOT NULL,
    date_of_birth TEXT NOT NULL,
    college_email TEXT NOT NULL,
    personal_email TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    is_pwd BOOLEAN NOT NULL DEFAULT false,
    branch TEXT NOT NULL,
    ug_percentage DECIMAL(5,2) NOT NULL,
    has_active_backlogs BOOLEAN NOT NULL DEFAULT false,
    resume_url TEXT,
    placement_status JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    location TEXT,
    package_range TEXT,
    min_ug_percentage DECIMAL(5,2),
    allow_backlogs BOOLEAN DEFAULT FALSE,
    eligible_branches JSONB,
    skills JSONB,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    counts_as_offer BOOLEAN DEFAULT TRUE,
    timeline JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_details(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'applied',
    current_stage TEXT DEFAULT 'applied',
    stage_history JSONB DEFAULT '[]',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, job_id)
);

-- Create grievances table
CREATE TABLE grievances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_details(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_student_details_user_id ON student_details(user_id);
CREATE INDEX idx_student_details_college_reg_no ON student_details(college_reg_no);
CREATE INDEX idx_student_details_branch ON student_details(branch);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_deadline ON jobs(deadline);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_grievances_student_id ON grievances(student_id);
CREATE INDEX idx_grievances_status ON grievances(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_student_details_updated_at 
    BEFORE UPDATE ON student_details 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grievances_updated_at 
    BEFORE UPDATE ON grievances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert admin user (password: Admin@123)
INSERT INTO users (email, password, role) VALUES 
('admin@msruas.ac.in', '$2b$10$8K1p/a0dclxKlZOLvH.hs.HpaFy8GGKP6SY.XOI3.J5VPZRzd3bOq', 'admin');

-- Insert sample student user (password: Student@123)
INSERT INTO users (id, email, password, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '22cse123456@msruas.ac.in', '$2b$10$8K1p/a0dclxKlZOLvH.hs.HpaFy8GGKP6SY.XOI3.J5VPZRzd3bOq', 'student');

-- Insert sample student details
INSERT INTO student_details (
    user_id, first_name, gender, college_reg_no, date_of_birth, 
    college_email, personal_email, mobile_number, is_pwd, branch, 
    ug_percentage, has_active_backlogs
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001', 'Rahul Kumar', 'Male', '22CSE123456', '2004-03-15',
    '22cse123456@msruas.ac.in', 'rahul.kumar@gmail.com', '9876543210', false, 'CSE',
    85.5, false
);

-- Insert sample jobs with different branches
INSERT INTO jobs (title, company, description, location, package_range, min_ug_percentage, allow_backlogs, eligible_branches, skills, deadline) VALUES
('Software Engineer Trainee', 'TCS', 'Join our team as a Software Engineer Trainee and work on cutting-edge technology projects.', 'Bangalore', '3.5-4.5 LPA', 70.0, false, '["CSE", "ISE", "ECE", "EEE"]', '["Java", "Python", "SQL", "Problem Solving"]', NOW() + INTERVAL '30 days'),
('Data Analyst', 'Infosys', 'Analyze complex data sets and provide actionable insights for business decisions.', 'Hyderabad', '4.0-5.0 LPA', 75.0, false, '["CSE", "ISE", "AIML"]', '["Python", "R", "SQL", "Excel", "Statistics"]', NOW() + INTERVAL '25 days'),
('Frontend Developer Intern', 'Wipro', '6-month internship program focusing on modern web development technologies.', 'Chennai', '15,000-20,000 per month', 65.0, true, '["CSE", "ISE", "ECE"]', '["React", "JavaScript", "HTML", "CSS", "Git"]', NOW() + INTERVAL '20 days'),
('Mechanical Design Engineer', 'Bosch', 'Design and develop mechanical components for automotive applications.', 'Bangalore', '4.5-6.0 LPA', 70.0, false, '["Mechanical", "Automotive"]', '["CAD", "SolidWorks", "AutoCAD", "Design"]', NOW() + INTERVAL '35 days'),
('Civil Engineer', 'L&T Construction', 'Work on infrastructure projects and construction management.', 'Mumbai', '4.0-5.5 LPA', 65.0, true, '["Civil"]', '["AutoCAD", "Project Management", "Construction"]', NOW() + INTERVAL '28 days'),
('Electronics Engineer', 'Intel', 'Develop next-generation processors and electronic systems.', 'Bangalore', '5.0-7.0 LPA', 75.0, false, '["ECE", "EEE"]', '["VLSI", "Digital Design", "C++", "MATLAB"]', NOW() + INTERVAL '40 days'),
('AI/ML Engineer', 'Microsoft', 'Build intelligent systems using machine learning and AI technologies.', 'Hyderabad', '6.0-8.0 LPA', 80.0, false, '["CSE", "AIML", "ISE"]', '["Python", "TensorFlow", "PyTorch", "Machine Learning"]', NOW() + INTERVAL '45 days'),
('Robotics Engineer', 'DRDO', 'Design and develop robotic systems for defense applications.', 'Bangalore', '5.5-7.5 LPA', 75.0, false, '["Robotics", "Mechanical", "ECE"]', '["ROS", "Python", "C++", "Control Systems"]', NOW() + INTERVAL '50 days'),
('Aerospace Engineer', 'ISRO', 'Work on satellite and rocket technologies for space missions.', 'Bangalore', '6.0-8.5 LPA', 78.0, false, '["Aerospace", "Mechanical"]', '["MATLAB", "CFD", "CAD", "Thermodynamics"]', NOW() + INTERVAL '55 days'),
('Media Specialist', 'Zee Entertainment', 'Create engaging content for digital media platforms.', 'Mumbai', '3.0-4.5 LPA', 65.0, true, '["MC"]', '["Adobe Creative Suite", "Video Editing", "Content Writing"]', NOW() + INTERVAL '30 days');

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Disable RLS for easier authentication (enable later if needed for security)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE student_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE grievances DISABLE ROW LEVEL SECURITY;

-- Create a view for application statistics
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    j.id as job_id,
    j.title,
    j.company,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'applied' THEN 1 END) as applied_count,
    COUNT(CASE WHEN a.status = 'under_review' THEN 1 END) as under_review_count,
    COUNT(CASE WHEN a.status = 'shortlisted' THEN 1 END) as shortlisted_count,
    COUNT(CASE WHEN a.status = 'selected' THEN 1 END) as selected_count,
    COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) as rejected_count
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, j.title, j.company;

-- Create a function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_students', (SELECT COUNT(*) FROM student_details),
        'total_jobs', (SELECT COUNT(*) FROM jobs),
        'active_jobs', (SELECT COUNT(*) FROM jobs WHERE is_active = true),
        'total_applications', (SELECT COUNT(*) FROM applications),
        'pending_applications', (SELECT COUNT(*) FROM applications WHERE status IN ('applied', 'under_review')),
        'placed_students', (SELECT COUNT(DISTINCT student_id) FROM applications WHERE status = 'selected')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create additional sample students for testing
INSERT INTO users (id, email, password, role) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '22mech789012@msruas.ac.in', '$2b$10$8K1p/a0dclxKlZOLvH.hs.HpaFy8GGKP6SY.XOI3.J5VPZRzd3bOq', 'student'),
('550e8400-e29b-41d4-a716-446655440003', '22civil345678@msruas.ac.in', '$2b$10$8K1p/a0dclxKlZOLvH.hs.HpaFy8GGKP6SY.XOI3.J5VPZRzd3bOq', 'student'),
('550e8400-e29b-41d4-a716-446655440004', '22ece901234@msruas.ac.in', '$2b$10$8K1p/a0dclxKlZOLvH.hs.HpaFy8GGKP6SY.XOI3.J5VPZRzd3bOq', 'student');

INSERT INTO student_details (
    user_id, first_name, gender, college_reg_no, date_of_birth, 
    college_email, personal_email, mobile_number, is_pwd, branch, 
    ug_percentage, has_active_backlogs
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440002', 'Priya Sharma', 'Female', '22MECH789012', '2004-06-20',
    '22mech789012@msruas.ac.in', 'priya.sharma@gmail.com', '9876543211', false, 'Mechanical',
    82.3, false
),
(
    '550e8400-e29b-41d4-a716-446655440003', 'Amit Patel', 'Male', '22CIVIL345678', '2004-01-10',
    '22civil345678@msruas.ac.in', 'amit.patel@gmail.com', '9876543212', false, 'Civil',
    78.9, true
),
(
    '550e8400-e29b-41d4-a716-446655440004', 'Sneha Reddy', 'Female', '22ECE901234', '2004-09-15',
    '22ece901234@msruas.ac.in', 'sneha.reddy@gmail.com', '9876543213', false, 'ECE',
    88.1, false
);

COMMIT;
