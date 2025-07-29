import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users, 
  studentDetails, 
  jobs, 
  applications, 
  applicationStatus,
  grievances,
  admins,
  type User,
  type InsertUser,
  type StudentDetails,
  type InsertStudentDetails,
  type Job,
  type InsertJob,
  type Application,
  type InsertApplication,
  type Grievance,
  type InsertGrievance
} from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Nava@2005@db.kcqmpjwlukoibwvpgzls.supabase.co:5432/postgres";

// Disable prepared statements for Supabase connection pooling
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

export interface IStorage {
  // Auth methods
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  
  // Student methods
  createStudentDetails(details: InsertStudentDetails): Promise<StudentDetails>;
  getStudentByUserId(userId: string): Promise<StudentDetails | undefined>;
  getStudentByRegNo(regNo: string): Promise<StudentDetails | undefined>;
  updateStudentDetails(id: string, details: Partial<StudentDetails>): Promise<StudentDetails>;
  
  // Job methods
  createJob(job: InsertJob): Promise<Job>;
  getJobs(filters?: { isActive?: boolean }): Promise<Job[]>;
  getJobById(id: string): Promise<Job | undefined>;
  updateJob(id: string, job: Partial<Job>): Promise<Job>;
  deleteJob(id: string): Promise<void>;
  
  // Application methods
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByStudent(studentId: string): Promise<Application[]>;
  getApplicationsByJob(jobId: string): Promise<Application[]>;
  updateApplicationStatus(id: string, status: string, stage: string): Promise<Application>;
  checkExistingApplication(studentId: string, jobId: string): Promise<Application | undefined>;
  
  // Grievance methods
  createGrievance(grievance: InsertGrievance): Promise<Grievance>;
  getGrievances(): Promise<Grievance[]>;
  updateGrievanceStatus(id: string, status: string, response?: string): Promise<Grievance>;
  
  // Admin methods
  getAdminByUserId(userId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async createStudentDetails(details: InsertStudentDetails): Promise<StudentDetails> {
    // First create user
    const user = await this.createUser({
      email: details.collegeEmail,
      password: details.password,
      role: "student"
    });

    // Then create student details
    const { password, ...studentData } = details;
    const [student] = await db.insert(studentDetails).values({
      ...studentData,
      userId: user.id,
      placementStatus: { offers: 0, acceptedOffers: [], rejectedOffers: [] }
    }).returning();

    return student;
  }

  async getStudentByUserId(userId: string): Promise<StudentDetails | undefined> {
    const [student] = await db.select().from(studentDetails).where(eq(studentDetails.userId, userId));
    return student;
  }

  async getStudentByRegNo(regNo: string): Promise<StudentDetails | undefined> {
    const [student] = await db.select().from(studentDetails).where(eq(studentDetails.collegeRegNo, regNo));
    return student;
  }

  async updateStudentDetails(id: string, details: Partial<StudentDetails>): Promise<StudentDetails> {
    const [student] = await db.update(studentDetails)
      .set({ ...details, updatedAt: new Date() })
      .where(eq(studentDetails.id, id))
      .returning();
    return student;
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async getJobs(filters?: { isActive?: boolean }): Promise<Job[]> {
    let query = db.select().from(jobs);
    
    if (filters?.isActive !== undefined) {
      query = query.where(eq(jobs.isActive, filters.isActive));
    }
    
    return query.orderBy(desc(jobs.createdAt));
  }

  async getJobById(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async updateJob(id: string, job: Partial<Job>): Promise<Job> {
    const [updatedJob] = await db.update(jobs)
      .set({ ...job, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return updatedJob;
  }

  async deleteJob(id: string): Promise<void> {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values({
      ...application,
      stageHistory: [{ stage: "applied", timestamp: new Date(), status: "completed" }]
    }).returning();
    return newApplication;
  }

  async getApplicationsByStudent(studentId: string): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.studentId, studentId));
  }

  async getApplicationsByJob(jobId: string): Promise<Application[]> {
    return db.select().from(applications).where(eq(applications.jobId, jobId));
  }

  async updateApplicationStatus(id: string, status: string, stage: string): Promise<Application> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    
    const newStageEntry = {
      stage,
      timestamp: new Date(),
      status: "completed"
    };
    
    const updatedHistory = [...(application.stageHistory as any[] || []), newStageEntry];
    
    const [updatedApplication] = await db.update(applications)
      .set({
        status,
        currentStage: stage,
        stageHistory: updatedHistory,
        updatedAt: new Date()
      })
      .where(eq(applications.id, id))
      .returning();
      
    return updatedApplication;
  }

  async checkExistingApplication(studentId: string, jobId: string): Promise<Application | undefined> {
    const [application] = await db.select().from(applications)
      .where(and(eq(applications.studentId, studentId), eq(applications.jobId, jobId)));
    return application;
  }

  async createGrievance(grievance: InsertGrievance): Promise<Grievance> {
    const [newGrievance] = await db.insert(grievances).values(grievance).returning();
    return newGrievance;
  }

  async getGrievances(): Promise<Grievance[]> {
    return db.select().from(grievances).orderBy(desc(grievances.createdAt));
  }

  async updateGrievanceStatus(id: string, status: string, response?: string): Promise<Grievance> {
    const [grievance] = await db.update(grievances)
      .set({ status, response, updatedAt: new Date() })
      .where(eq(grievances.id, id))
      .returning();
    return grievance;
  }

  async getAdminByUserId(userId: string): Promise<any> {
    const [admin] = await db.select().from(admins).where(eq(admins.userId, userId));
    return admin;
  }
}

export const storage = new DatabaseStorage();
