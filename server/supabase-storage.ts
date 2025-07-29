
import { createClient } from '@supabase/supabase-js';
import bcrypt from "bcrypt";
import type {
  User,
  InsertUser,
  StudentDetails,
  InsertStudentDetails,
  Job,
  InsertJob,
  Application,
  InsertApplication,
  Grievance,
  InsertGrievance
} from "@shared/schema";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://kcqmpjwlukoibwvpgzls.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcW1wandsdWtvaWJ3dnBnemxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3OTEyNTgsImV4cCI6MjA2OTM2NzI1OH0.lytFGkPbYpXmvOs4cmltk5Ty9Ua5YtHR6m2es2QiQOo";

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseStorage {
  // User methods
  async createUser(data: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert({ ...data, password: hashedPassword })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  // Student details methods
  async createStudentDetails(data: InsertStudentDetails): Promise<StudentDetails> {
    const { data: student, error } = await supabase
      .from('student_details')
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return student;
  }

  async getStudentDetailsByUserId(userId: string): Promise<StudentDetails | null> {
    const { data, error } = await supabase
      .from('student_details')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  async updateStudentDetails(id: string, data: Partial<StudentDetails>): Promise<StudentDetails> {
    const { data: student, error } = await supabase
      .from('student_details')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return student;
  }

  async getAllStudentDetails(): Promise<StudentDetails[]> {
    const { data, error } = await supabase
      .from('student_details')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  // Job methods
  async createJob(data: InsertJob): Promise<Job> {
    const { data: job, error } = await supabase
      .from('jobs')
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return job;
  }

  async getAllJobs(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getActiveJobs(): Promise<Job[]> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getJobById(id: string): Promise<Job | null> {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  async updateJob(id: string, data: Partial<Job>): Promise<Job> {
    const { data: job, error } = await supabase
      .from('jobs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return job;
  }

  async deleteJob(id: string): Promise<void> {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw new Error(error.message);
  }

  // Application methods
  async createApplication(data: InsertApplication): Promise<Application> {
    const { data: application, error } = await supabase
      .from('applications')
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return application;
  }

  async getApplicationsByStudentId(studentId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (*)
      `)
      .eq('student_id', studentId)
      .order('applied_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getApplicationsByJobId(jobId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        student_details (*)
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAllApplications(): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (*),
        student_details (*)
      `)
      .order('applied_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async updateApplicationStatus(id: string, status: string, stage?: string): Promise<Application> {
    const updateData: any = { status };
    if (stage) updateData.current_stage = stage;
    
    const { data: application, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return application;
  }

  async getApplicationByStudentAndJob(studentId: string, jobId: string): Promise<Application | null> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('student_id', studentId)
      .eq('job_id', jobId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw new Error(error.message);
    return data;
  }

  // Grievance methods
  async createGrievance(data: InsertGrievance): Promise<Grievance> {
    const { data: grievance, error } = await supabase
      .from('grievances')
      .insert(data)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return grievance;
  }

  async getGrievancesByStudentId(studentId: string): Promise<Grievance[]> {
    const { data, error } = await supabase
      .from('grievances')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAllGrievances(): Promise<Grievance[]> {
    const { data, error } = await supabase
      .from('grievances')
      .select(`
        *,
        student_details (*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return data || [];
  }

  async updateGrievanceStatus(id: string, status: string): Promise<Grievance> {
    const { data: grievance, error } = await supabase
      .from('grievances')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    return grievance;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    
    if (error) throw new Error(error.message);
    return data;
  }

  // Verify password
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const storage = new SupabaseStorage();
