// Simplified storage implementation that works without external DB
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
}

interface StudentDetails {
  id: string;
  userId: string;
  firstName: string;
  gender: string;
  collegeRegNo: string;
  dateOfBirth: string;
  collegeEmail: string;
  personalEmail: string;
  mobileNumber: string;
  isPWD: boolean;
  branch: string;
  ugPercentage: number;
  hasActiveBacklogs: boolean;
  resumeUrl?: string;
  placementStatus: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Job {
  id: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  packageRange?: string;
  minUGPercentage?: number;
  allowBacklogs: boolean;
  eligibleBranches: string[];
  skills: string[];
  deadline: Date;
  isActive: boolean;
  countsAsOffer: boolean;
  timeline?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Application {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  currentStage: string;
  stageHistory: any[];
  appliedAt: Date;
  updatedAt: Date;
}

interface Grievance {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category?: string;
  priority: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SimpleStorage {
  private users: Map<string, User> = new Map();
  private students: Map<string, StudentDetails> = new Map();
  private jobs: Map<string, Job> = new Map();
  private applications: Map<string, Application> = new Map();
  private grievances: Map<string, Grievance> = new Map();

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Create admin user
    const adminId = randomUUID();
    const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
    
    this.users.set(adminId, {
      id: adminId,
      email: "admin@msruas.ac.in",
      password: adminPasswordHash,
      role: "admin",
      createdAt: new Date()
    });

    // Create sample student
    const studentUserId = randomUUID();
    const studentPasswordHash = await bcrypt.hash("Student@123", 10);
    
    this.users.set(studentUserId, {
      id: studentUserId,
      email: "22cse123456@msruas.ac.in",
      password: studentPasswordHash,
      role: "student",
      createdAt: new Date()
    });

    const studentDetailsId = randomUUID();
    this.students.set(studentDetailsId, {
      id: studentDetailsId,
      userId: studentUserId,
      firstName: "Rahul Kumar",
      gender: "Male",
      collegeRegNo: "22CSE123456",
      dateOfBirth: "2004-03-15",
      collegeEmail: "22cse123456@msruas.ac.in",
      personalEmail: "rahul.kumar@gmail.com",
      mobileNumber: "9876543210",
      isPWD: false,
      branch: "CSE",
      ugPercentage: 85.5,
      hasActiveBacklogs: false,
      placementStatus: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create sample jobs
    const jobId1 = randomUUID();
    this.jobs.set(jobId1, {
      id: jobId1,
      title: "Software Engineer Trainee",
      company: "TCS",
      description: "Join our team as a Software Engineer Trainee",
      location: "Bangalore",
      packageRange: "3.5-4.5 LPA",
      minUGPercentage: 70.0,
      allowBacklogs: false,
      eligibleBranches: ["CSE", "ISE", "ECE", "EEE"],
      skills: ["Java", "Python", "SQL"],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      countsAsOffer: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const jobId2 = randomUUID();
    this.jobs.set(jobId2, {
      id: jobId2,
      title: "Data Analyst",
      company: "Infosys",
      description: "Analyze complex data sets for business insights",
      location: "Hyderabad",
      packageRange: "4.0-5.0 LPA",
      minUGPercentage: 75.0,
      allowBacklogs: false,
      eligibleBranches: ["CSE", "ISE", "AIML"],
      skills: ["Python", "R", "SQL", "Excel"],
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      isActive: true,
      countsAsOffer: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // User methods
  async createUser(data: { email: string; password: string; role: string }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: data.email,
      password: data.password,
      role: data.role,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Student methods
  async createStudentDetails(data: any): Promise<StudentDetails> {
    const id = randomUUID();
    const student: StudentDetails = {
      id,
      userId: data.userId,
      firstName: data.firstName,
      gender: data.gender,
      collegeRegNo: data.collegeRegNo,
      dateOfBirth: data.dateOfBirth,
      collegeEmail: data.collegeEmail,
      personalEmail: data.personalEmail,
      mobileNumber: data.mobileNumber,
      isPWD: data.isPWD,
      branch: data.branch,
      ugPercentage: data.ugPercentage,
      hasActiveBacklogs: data.hasActiveBacklogs,
      resumeUrl: data.resumeUrl,
      placementStatus: data.placementStatus || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.students.set(id, student);
    return student;
  }

  async getStudentByUserId(userId: string): Promise<StudentDetails | undefined> {
    for (const student of this.students.values()) {
      if (student.userId === userId) {
        return student;
      }
    }
    return undefined;
  }

  async getStudentByRegNo(regNo: string): Promise<StudentDetails | undefined> {
    for (const student of this.students.values()) {
      if (student.collegeRegNo === regNo) {
        return student;
      }
    }
    return undefined;
  }

  async getAllStudents(): Promise<StudentDetails[]> {
    return Array.from(this.students.values());
  }

  async updateStudentDetails(id: string, data: any): Promise<StudentDetails | undefined> {
    const student = this.students.get(id);
    if (student) {
      const updated = { ...student, ...data, updatedAt: new Date() };
      this.students.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Job methods
  async createJob(data: any): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      id,
      title: data.title,
      company: data.company,
      description: data.description,
      location: data.location,
      packageRange: data.packageRange,
      minUGPercentage: data.minUGPercentage,
      allowBacklogs: data.allowBacklogs,
      eligibleBranches: data.eligibleBranches,
      skills: data.skills,
      deadline: data.deadline,
      isActive: data.isActive,
      countsAsOffer: data.countsAsOffer,
      timeline: data.timeline,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.jobs.set(id, job);
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }

  async getActiveJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.isActive);
  }

  async getJobById(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async updateJob(id: string, data: any): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (job) {
      const updated = { ...job, ...data, updatedAt: new Date() };
      this.jobs.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Application methods
  async createApplication(data: any): Promise<Application> {
    const id = randomUUID();
    const application: Application = {
      id,
      studentId: data.studentId,
      jobId: data.jobId,
      status: data.status || "applied",
      currentStage: data.currentStage || "applied",
      stageHistory: data.stageHistory || [],
      appliedAt: new Date(),
      updatedAt: new Date()
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplicationsByStudentId(studentId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.studentId === studentId);
  }

  async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(app => app.jobId === jobId);
  }

  async getAllApplications(): Promise<Application[]> {
    return Array.from(this.applications.values());
  }

  async updateApplication(id: string, data: any): Promise<Application | undefined> {
    const application = this.applications.get(id);
    if (application) {
      const updated = { ...application, ...data, updatedAt: new Date() };
      this.applications.set(id, updated);
      return updated;
    }
    return undefined;
  }

  // Grievance methods
  async createGrievance(data: any): Promise<Grievance> {
    const id = randomUUID();
    const grievance: Grievance = {
      id,
      studentId: data.studentId,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || "medium",
      status: data.status || "open",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.grievances.set(id, grievance);
    return grievance;
  }

  async getGrievancesByStudentId(studentId: string): Promise<Grievance[]> {
    return Array.from(this.grievances.values()).filter(g => g.studentId === studentId);
  }

  async getAllGrievances(): Promise<Grievance[]> {
    return Array.from(this.grievances.values());
  }

  async updateGrievance(id: string, data: any): Promise<Grievance | undefined> {
    const grievance = this.grievances.get(id);
    if (grievance) {
      const updated = { ...grievance, ...data, updatedAt: new Date() };
      this.grievances.set(id, updated);
      return updated;
    }
    return undefined;
  }
}