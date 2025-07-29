# Sample Credentials for Testing

## Admin Account
**Email:** admin@msruas.ac.in  
**Password:** Admin@123  
**Role:** Administrator  

**Access:** 
- Complete system access
- View all student applications
- Manage job postings
- Export data in CSV/Excel formats
- Grievance management

## Student Account
**Email:** 22cse123456@msruas.ac.in  
**Password:** Student@123  
**Registration No:** 22CSE123456  
**Branch:** CSE  
**Name:** Rahul Kumar  
**Personal Email:** rahul.kumar@gmail.com  
**Mobile:** 9876543210  
**UG Percentage:** 85.5  
**Active Backlogs:** No  

**Access:**
- Browse and apply for jobs
- Track application status
- Update profile and resume
- Submit grievances

## Student Account 2
**Email:** 22ise789012@msruas.ac.in  
**Password:** Student@123  
**Registration No:** 22ISE789012  
**Branch:** ISE  
**Name:** Priya Sharma  
**Personal Email:** priya.sharma@gmail.com  
**Mobile:** 8765432109  
**UG Percentage:** 78.2  
**Active Backlogs:** Yes  

## Resume Upload Instructions

When uploading resumes:
1. **File Format:** Only PDF files are accepted
2. **File Name:** Must be in format `{registration_no}.pdf` (e.g., `22CSE123456.pdf`)
3. **File Size:** Maximum 5MB
4. **Storage Location:** Files are stored in Supabase buckets organized by branch:
   - `CSE/22CSE123456.pdf`
   - `ISE/22ISE789012.pdf`
   - etc.

## Available Branches
- CSE (Computer Science Engineering)
- ISE (Information Science Engineering) 
- AIML (Artificial Intelligence & Machine Learning)
- MC (Media Communications)
- EEE (Electrical & Electronics Engineering)
- ECE (Electronics & Communication Engineering)
- Civil (Civil Engineering)
- Mechanical (Mechanical Engineering)
- Robotics (Robotics Engineering)
- Aerospace (Aerospace Engineering)
- Automotive (Automotive Engineering)

## Database Setup

Run the `supabase-setup.sql` script in your Supabase SQL Editor to create:
- All required tables with proper relationships
- Sample data for testing
- Row Level Security (RLS) policies
- Storage bucket for resumes
- Admin and sample student accounts

## Notes

- The admin password is bcrypt hashed in the database
- Student registration requires college email format validation
- Resume uploads are stored in Supabase Storage with branch-wise organization
- All data is properly validated before storage