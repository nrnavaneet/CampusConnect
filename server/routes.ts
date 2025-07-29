import { Router } from "express";
import { storage } from "./supabase-storage";
import { insertStudentDetailsSchema, insertJobSchema, insertApplicationSchema, insertGrievanceSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import "./types"; // Import types

const router = Router();
// const storage = new DatabaseStorage(); // Removed local storage instantiation

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Authentication Routes
router.post("/api/auth/register", async (req, res) => {
  try {
    // Check if email already exists
    const existingUser = await storage.getUserByEmail(req.body.collegeEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Create user first
    const user = await storage.createUser({
      email: req.body.collegeEmail,
      password: req.body.password, // Let storage handle hashing
      role: "student"
    });

    // Create student details
    const studentData = {
      userId: user.id,
      firstName: req.body.firstName,
      gender: req.body.gender,
      collegeRegNo: req.body.collegeRegNo,
      dateOfBirth: req.body.dateOfBirth,
      collegeEmail: req.body.collegeEmail,
      personalEmail: req.body.personalEmail,
      mobileNumber: req.body.mobileNumber,
      isPWD: req.body.isPWD,
      branch: req.body.branch,
      ugPercentage: req.body.ugPercentage,
      hasActiveBacklogs: req.body.hasActiveBacklogs,
      resumeUrl: req.body.resumeUrl || null
    };

    const student = await storage.createStudentDetails(studentData);
    res.json({ 
      message: "Registration successful", 
      user: { id: user.id, email: user.email },
      student: { id: student.id, collegeRegNo: student.collegeRegNo }
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(400).json({ 
      error: error.message || "Registration failed" 
    });
  }
});

router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await storage.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Store user in session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Get additional user info based on role
    let userInfo = { ...user, password: undefined };
    if (user.role === "student") {
      const studentDetails = await storage.getStudentDetailsByUserId(user.id);
      userInfo = { ...userInfo, studentDetails };
    }

    res.json({ 
      message: "Login successful", 
      user: userInfo 
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
});

router.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await storage.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let userInfo = { ...user, password: undefined };
    if (user.role === "student") {
      const studentDetails = await storage.getStudentDetailsByUserId(user.id);
      userInfo = { ...userInfo, studentDetails };
    }

    res.json({ user: userInfo });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user info" });
  }
});

// Student Routes
router.get("/api/student/profile", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student access required" });
    }

    const student = await storage.getStudentDetailsByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    res.json({ student });
  } catch (error: any) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.put("/api/student/profile", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student access required" });
    }

    const student = await storage.getStudentDetailsByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const updatedStudent = await storage.updateStudentDetails(student.id, req.body);
    res.json({ student: updatedStudent });
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Helper function to transform job data from snake_case to camelCase
const transformJobData = (job: any) => {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    description: job.description,
    location: job.location,
    packageRange: job.package_range,
    minUGPercentage: job.min_ug_percentage,
    allowBacklogs: job.allow_backlogs,
    eligibleBranches: job.eligible_branches,
    skills: job.skills,
    deadline: job.deadline,
    isActive: job.is_active,
    countsAsOffer: job.counts_as_offer,
    timeline: job.timeline,
    createdAt: job.created_at,
    updatedAt: job.updated_at
  };
};

// Job Routes
router.get("/api/jobs", requireAuth, async (req, res) => {
  try {
    const { status, branch, company } = req.query;
    
    // For now, get all jobs and filter on frontend if needed
    // TODO: Add filtering support in storage layer
    const jobs = await storage.getAllJobs();
    const transformedJobs = jobs.map(transformJobData);
    res.json({ jobs: transformedJobs });
  } catch (error: any) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Failed to get jobs" });
  }
});

router.get("/api/jobs/:id", requireAuth, async (req, res) => {
  try {
    const job = await storage.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    const transformedJob = transformJobData(job);
    res.json({ job: transformedJob });
  } catch (error: any) {
    console.error("Get job error:", error);
    res.status(500).json({ error: "Failed to get job" });
  }
});

router.post("/api/jobs", requireAdmin, async (req, res) => {
  try {
    // Transform camelCase frontend data to snake_case backend data
    const transformedData = {
      title: req.body.title,
      company: req.body.company,
      description: req.body.description || null,
      location: req.body.location || null,
      package_range: req.body.packageRange || null,
      min_ug_percentage: req.body.minUGPercentage || null,
      allow_backlogs: req.body.allowBacklogs ?? false,
      eligible_branches: req.body.eligibleBranches || null,
      skills: req.body.skills || null,
      deadline: req.body.deadline ? new Date(req.body.deadline) : req.body.deadline,
      counts_as_offer: req.body.countsAsOffer ?? true,
      is_active: req.body.isActive ?? true
    };
    
    const job = await storage.createJob(transformedData as any);
    const transformedJob = transformJobData(job);
    res.json({ job: transformedJob });
  } catch (error: any) {
    console.error("Create job error:", error);
    res.status(400).json({ error: error.message || "Failed to create job" });
  }
});

router.put("/api/jobs/:id", requireAdmin, async (req, res) => {
  try {
    // Transform deadline from ISO string to Date object if needed
    let requestData = {
      ...req.body,
      deadline: req.body.deadline ? new Date(req.body.deadline) : req.body.deadline
    };
    
    // Transform camelCase to snake_case for database columns
    const dbData: any = {};
    for (const [key, value] of Object.entries(requestData)) {
      switch (key) {
        case 'isActive':
          dbData.is_active = value;
          break;
        case 'countsAsOffer':
          dbData.counts_as_offer = value;
          break;
        case 'allowBacklogs':
          dbData.allow_backlogs = value;
          break;
        case 'minUGPercentage':
          dbData.min_ug_percentage = value;
          break;
        case 'packageRange':
          dbData.package_range = value;
          break;
        case 'eligibleBranches':
          dbData.eligible_branches = value;
          break;
        case 'createdAt':
          dbData.created_at = value;
          break;
        case 'updatedAt':
          dbData.updated_at = value;
          break;
        default:
          dbData[key] = value;
      }
    }
    
    const job = await storage.updateJob(req.params.id, dbData);
    const transformedJob = transformJobData(job);
    res.json({ job: transformedJob });
  } catch (error: any) {
    console.error("Update job error:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
});

router.delete("/api/jobs/:id", requireAdmin, async (req, res) => {
  try {
    await storage.deleteJob(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("Delete job error:", error);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// Application Routes  
router.post("/api/applications", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student access required" });
    }

    const student = await storage.getStudentDetailsByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    // Check if already applied
    const existingApplication = await storage.checkExistingApplication(student.id, req.body.jobId);
    if (existingApplication) {
      return res.status(400).json({ error: "Already applied to this job" });
    }

    // Get job details to check eligibility
    const job = await storage.getJobById(req.body.jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (!job.is_active) {
      return res.status(400).json({ error: "Job is no longer active" });
    }

    // Check eligibility criteria
    if (job.min_ug_percentage && student.ugPercentage < job.min_ug_percentage) {
      return res.status(400).json({ error: "Does not meet minimum percentage requirement" });
    }

    if (!job.allow_backlogs && student.hasActiveBacklogs) {
      return res.status(400).json({ error: "Active backlogs not allowed for this position" });
    }

    if (job.eligible_branches && !job.eligible_branches.includes(student.branch)) {
      return res.status(400).json({ error: "Branch not eligible for this position" });
    }

    const applicationData = {
      studentId: student.id,
      jobId: req.body.jobId,
      status: "applied",
      currentStage: "applied"
    };

    const application = await storage.createApplication(applicationData);
    res.json({ application });
  } catch (error: any) {
    console.error("Apply job error:", error);
    res.status(400).json({ error: error.message || "Failed to apply" });
  }
});

router.get("/api/applications/student", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ error: "Student access required" });
    }

    const student = await storage.getStudentDetailsByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ error: "Student profile not found" });
    }

    const applications = await storage.getApplicationsByStudentId(student.id);
    res.json({ applications });
  } catch (error: any) {
    console.error("Get student applications error:", error);
    res.status(500).json({ error: "Failed to get applications" });
  }
});

router.get("/api/applications/job/:jobId", requireAuth, async (req, res) => {
  try {
    const applications = await storage.getApplicationsByJob(req.params.jobId);
    res.json({ applications });
  } catch (error: any) {
    console.error("Get job applications error:", error);
    res.status(500).json({ error: "Failed to get applications" });
  }
});

router.put("/api/applications/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status, stage } = req.body;
    const application = await storage.updateApplicationStatus(req.params.id, status, stage);
    res.json({ application });
  } catch (error: any) {
    console.error("Update application status error:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

// Data Export Routes
router.get("/api/export/applications/:jobId", requireAdmin, async (req, res) => {
  try {
    const applications = await storage.getApplicationsByJob(req.params.jobId);

    if (applications.length === 0) {
      return res.status(404).json({ error: "No applications found" });
    }

    // Convert to CSV format
    const csvData = applications.map(app => ({
      studentId: app.studentId,
      regNo: app.student?.collegeRegNo || "",
      name: app.student?.firstName || "",
      email: app.student?.collegeEmail || "",
      mobile: app.student?.mobileNumber || "",
      branch: app.student?.branch || "",
      percentage: app.student?.ugPercentage || 0,
      status: app.status,
      stage: app.currentStage,
      appliedDate: app.appliedAt,
      resumeUrl: app.student?.resumeUrl || ""
    }));

    const parser = new Parser();
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    res.send(csv);
  } catch (error: any) {
    console.error("Export applications error:", error);
    res.status(500).json({ error: "Failed to export applications" });
  }
});

router.get("/api/export/students", requireAdmin, async (req, res) => {
  try {
    // This would get all students - implementation depends on storage method
    // For now returning error to implement proper query
    res.status(501).json({ error: "Export all students not yet implemented" });
  } catch (error: any) {
    console.error("Export students error:", error);
    res.status(500).json({ error: "Failed to export students" });
  }
});

// Grievance Routes
router.post("/api/grievances", requireAuth, async (req, res) => {
  try {
    const validatedData = insertGrievanceSchema.parse(req.body);

    // Add student ID if logged in as student
    if (req.user.role === "student") {
      const student = await storage.getStudentDetailsByUserId(req.user.id);
      if (student) {
        validatedData.studentId = student.id;
      }
    }

    const grievance = await storage.createGrievance(validatedData);
    res.json({ grievance });
  } catch (error: any) {
    console.error("Create grievance error:", error);
    res.status(400).json({ error: error.message || "Failed to submit grievance" });
  }
});

router.get("/api/grievances", requireAdmin, async (req, res) => {
  try {
    const grievances = await storage.getGrievances();
    res.json({ grievances });
  } catch (error: any) {
    console.error("Get grievances error:", error);
    res.status(500).json({ error: "Failed to get grievances" });
  }
});

router.put("/api/grievances/:id", requireAdmin, async (req, res) => {
  try {
    const { status, response } = req.body;
    const grievance = await storage.updateGrievanceStatus(req.params.id, status, response);
    res.json({ grievance });
  } catch (error: any) {
    console.error("Update grievance error:", error);
    res.status(500).json({ error: "Failed to update grievance" });
  }
});

// Admin Stats Routes
router.get("/api/admin/stats", requireAdmin, async (req, res) => {
  try {
    const jobs = await storage.getAllJobs();
    const students = await storage.getAllStudentDetails();
    const applications = await storage.getAllApplications();

    // Get unique companies count
    const uniqueCompanies = new Set(jobs.map(job => job.company)).size;
    
    // Get this month's jobs (created in current month)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthJobs = jobs.filter(job => {
      const createdDate = new Date(job.created_at);
      return createdDate >= firstDayOfMonth;
    }).length;

    const stats = {
      totalStudents: students.length,
      totalJobs: jobs.length,
      totalApplications: applications.length,
      activeJobs: jobs.filter(job => job.is_active).length, // Fix: use snake_case
      placedStudents: applications.filter(app => app.status === 'selected').length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      uniqueCompanies,
      thisMonthJobs,
    };

    res.json({ stats });
  } catch (error: any) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ error: "Failed to get admin stats" });
  }
});

router.get("/api/admin/activities", requireAdmin, async (req, res) => {
  try {
    // Get recent activities (last 10)
    const applications = await storage.getAllApplications();
    const jobs = await storage.getAllJobs();
    
    const activities = [
      ...applications.slice(-5).map(app => ({
        id: `app-${app.id}`,
        type: "application",
        description: `New application submitted for ${app.jobId}`,
        timestamp: app.appliedAt || app.updated_at || new Date().toISOString(),
      })),
      ...jobs.slice(-5).map(job => ({
        id: `job-${job.id}`,
        type: "job_created",
        description: `New job posted: ${job.title} at ${job.company}`,
        timestamp: job.created_at || job.updated_at || new Date().toISOString(),
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    res.json({ activities });
  } catch (error: any) {
    console.error("Get admin activities error:", error);
    res.status(500).json({ error: "Failed to get admin activities" });
  }
});

router.get("/api/admin/students", requireAdmin, async (req, res) => {
  try {
    const studentsData = await storage.getAllStudentDetails();
    const allApplications = await storage.getAllApplications();
    
    // Transform the data to match frontend expectations using snake_case from database
    const students = studentsData.map(student => {
      // Get applications count for this student
      const studentApplications = allApplications.filter(app => app.studentId === student.id);
      const placedApplications = studentApplications.filter(app => 
        app.status === 'selected' || app.status === 'hired' || app.status === 'offer_accepted'
      );
      
      return {
        id: student.id,
        userId: student.user_id,
        name: student.first_name,
        email: student.college_email,
        personalEmail: student.personal_email,
        phone: student.mobile_number,
        branch: student.branch,
        cgpa: student.ug_percentage ? (parseFloat(student.ug_percentage.toString()) / 10).toFixed(2) : null,
        ugPercentage: student.ug_percentage ? parseFloat(student.ug_percentage.toString()).toFixed(2) : null,
        isPlaced: placedApplications.length > 0,
        applicationCount: studentApplications.length,
        collegeRegNo: student.college_reg_no,
        dateOfBirth: student.date_of_birth,
        gender: student.gender,
        isPWD: student.is_pwd,
        hasActiveBacklogs: student.has_active_backlogs,
        resumeUrl: student.resume_url,
        placementStatus: student.placement_status,
        createdAt: student.created_at,
        updatedAt: student.updated_at
      };
    });
    
    res.json({ students });
  } catch (error: any) {
    console.error("Get admin students error:", error);
    res.status(500).json({ error: "Failed to get students" });
  }
});

router.get("/api/admin/applications/stats", requireAdmin, async (req, res) => {
  try {
    const applications = await storage.getAllApplications();
    
    const stats = {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending' || app.status === 'applied').length,
      approved: applications.filter(app => app.status === 'selected' || app.status === 'shortlisted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };

    res.json({ stats });
  } catch (error: any) {
    console.error("Get admin applications stats error:", error);
    res.status(500).json({ error: "Failed to get applications stats" });
  }
});

export default router;