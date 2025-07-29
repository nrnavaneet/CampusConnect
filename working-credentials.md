# Working System Test Credentials

## Current Status
The Campus Placement Portal is now fully configured with:

✅ **Frontend Features:**
- Beautiful animated UI with mouse trail effects
- Responsive design with dark/light theme
- Smooth scrolling and particle backgrounds
- Registration form with college email validation
- Resume upload with branch-wise organization

✅ **Backend Setup:**
- Express.js server with session authentication
- Supabase database integration
- Resume storage in organized folders
- Data export capabilities

## Test the System

### Admin Login
**URL:** http://localhost:5000/auth  
**Email:** admin@msruas.ac.in  
**Password:** Admin@123  

**Admin Features:**
- View all student applications
- Manage job postings
- Export data in CSV/Excel formats
- Handle grievances

### Test Registration (New Student)
**URL:** http://localhost:5000/auth  
**Tab:** Register  

**Sample Data for Testing:**
- **First Name:** Arjun Patel
- **Gender:** Male
- **College Registration No:** 22CSE456789
- **Date of Birth:** 2004-08-20
- **College Email:** 22cse456789@msruas.ac.in
- **Personal Email:** arjun.patel@gmail.com
- **Mobile:** 9123456789
- **Branch:** CSE
- **UG Percentage:** 82.5
- **Active Backlogs:** No
- **Password:** Student@123

### Resume Upload Instructions
1. **File Format:** Only PDF files accepted
2. **File Naming:** Name your file as `22CSE456789.pdf` (your registration number)
3. **Storage:** Files are automatically organized by branch in Supabase
   - Path: `CSE/22CSE456789.pdf`
   - Public URL generated automatically

### Available Branches
- CSE - Computer Science Engineering
- ISE - Information Science Engineering  
- AIML - Artificial Intelligence & Machine Learning
- MC - Media Communications
- EEE - Electrical & Electronics Engineering
- ECE - Electronics & Communication Engineering
- Civil - Civil Engineering
- Mechanical - Mechanical Engineering
- Robotics - Robotics Engineering
- Aerospace - Aerospace Engineering
- Automotive - Automotive Engineering

## Database Setup Status
The system automatically creates tables when you first run it. The following are set up:
- Users table with authentication
- Student details with academic information
- Jobs table with company postings
- Applications tracking
- Grievances system
- Resume storage buckets

## Next Steps
1. Run the SQL script in Supabase to initialize the database
2. Test student registration with the sample data above
3. Upload a resume using the naming convention
4. Login as admin to verify the system

## Troubleshooting
If you encounter issues:
1. Check the database connection in the console
2. Verify Supabase credentials are correct
3. Ensure the resumes bucket exists in Supabase Storage
4. Check that all environment variables are set