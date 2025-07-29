import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kcqmpjwlukoibwvpgzls.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjcW1wandsdWtvaWJ3dnBnemxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3OTEyNTgsImV4cCI6MjA2OTM2NzI1OH0.lytFGkPbYpXmvOs4cmltk5Ty9Ua5YtHR6m2es2QiQOo";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to upload resume to Supabase Storage
export async function uploadResume(file: File, registrationNo: string, branch: string): Promise<string> {
  const fileName = `${registrationNo}.pdf`;
  const filePath = `${branch}/${fileName}`;
  
  // Check if file is PDF
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed for resume upload');
  }
  
  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB');
  }
  
  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // Replace if exists
    });
    
  if (error) {
    console.error('Upload error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('resumes')
    .getPublicUrl(filePath);
    
  return publicUrl;
}

// Helper function to delete resume
export async function deleteResume(registrationNo: string, branch: string): Promise<void> {
  const fileName = `${registrationNo}.pdf`;
  const filePath = `${branch}/${fileName}`;
  
  const { error } = await supabase.storage
    .from('resumes')
    .remove([filePath]);
    
  if (error) {
    console.error('Delete error:', error);
    throw new Error(`Delete failed: ${error.message}`);
  }
}