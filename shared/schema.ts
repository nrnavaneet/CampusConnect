import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  boolean, 
  decimal, 
  integer,
  jsonb,
  uuid
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // student, admin
  createdAt: timestamp("created_at").defaultNow(),
});

// Student details table
export const studentDetails = pgTable("student_details", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  firstName: text("first_name").notNull(),
  gender: text("gender").notNull(),
  collegeRegNo: text("college_reg_no").notNull().unique(),
  dateOfBirth: text("date_of_birth").notNull(),
  collegeEmail: text("college_email").notNull(),
  personalEmail: text("personal_email").notNull(),
  mobileNumber: text("mobile_number").notNull(),
  isPWD: boolean("is_pwd").notNull(),
  branch: text("branch", { enum: ["CSE", "ISE", "MC", "AIML", "Aerospace", "Automotive", "EEE", "ECE", "Civil", "Mechanical", "Robotics"] }).notNull(),
  ugPercentage: decimal("ug_percentage", { precision: 5, scale: 2 }).notNull(),
  hasActiveBacklogs: boolean("has_active_backlogs").notNull(),
  resumeUrl: text("resume_url"),
  placementStatus: jsonb("placement_status").default({}), // Track offers, acceptances
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs table
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  location: text("location"),
  packageRange: text("package_range"),
  minUGPercentage: decimal("min_ug_percentage", { precision: 5, scale: 2 }),
  allowBacklogs: boolean("allow_backlogs").default(false),
  eligibleBranches: jsonb("eligible_branches"), // Array of branch codes
  skills: jsonb("skills"), // Array of required skills
  deadline: timestamp("deadline").notNull(),
  isActive: boolean("is_active").default(true),
  countsAsOffer: boolean("counts_as_offer").default(true),
  timeline: jsonb("timeline"), // Application stages and dates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applications table
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => studentDetails.id).notNull(),
  jobId: uuid("job_id").references(() => jobs.id).notNull(),
  status: text("status").default("applied"), // applied, under_review, shortlisted, interviewed, selected, rejected
  currentStage: text("current_stage").default("applied"),
  stageHistory: jsonb("stage_history").default([]), // Track stage changes with timestamps
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Application status tracking
export const applicationStatus = pgTable("application_status", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  applicationId: uuid("application_id").references(() => applications.id).notNull(),
  stage: text("stage").notNull(),
  status: text("status").notNull(), // completed, pending, scheduled
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Grievances table
export const grievances = pgTable("grievances", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: uuid("student_id").references(() => studentDetails.id),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  contactEmail: text("contact_email").notNull(),
  priority: text("priority").default("medium"), // low, medium, high
  status: text("status").default("submitted"), // submitted, in_progress, resolved
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admins table
export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  role: true,
});

export const insertStudentDetailsSchema = createInsertSchema(studentDetails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});

export const insertGrievanceSchema = createInsertSchema(grievances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StudentDetails = typeof studentDetails.$inferSelect;
export type InsertStudentDetails = z.infer<typeof insertStudentDetailsSchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Grievance = typeof grievances.$inferSelect;
export type InsertGrievance = z.infer<typeof insertGrievanceSchema>;

export type Admin = typeof admins.$inferSelect;
