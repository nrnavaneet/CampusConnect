// Test database connection
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Nava@2005@db.kcqmpjwlukoibwvpgzls.supabase.co:5432/postgres";

async function testConnection() {
  try {
    const sql = postgres(connectionString, { prepare: false });
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful:', result[0]);
    
    // Test if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('📋 Existing tables:', tables.map(t => t.table_name));
    
    // Create basic tables if they don't exist
    if (tables.length === 0) {
      console.log('🔨 Creating tables...');
      
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'student',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS student_details (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      `;
      
      // Insert admin user
      const adminExists = await sql`SELECT id FROM users WHERE email = 'admin@msruas.ac.in'`;
      if (adminExists.length === 0) {
        await sql`
          INSERT INTO users (email, password, role) VALUES 
          ('admin@msruas.ac.in', '$2b$10$8K1p/a0dclxKlZOLvH.hs.HpaFy8GGKP6SY.XOI3.J5VPZRzd3bOq', 'admin')
        `;
        console.log('👤 Admin user created');
      }
      
      console.log('✅ Tables created successfully');
    }
    
    await sql.end();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();