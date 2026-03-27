// Simple database test without dotenv
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = "postgresql://neondb_owner:npg_P6JtUT7KfbpO@ep-red-pine-ahd8rrhu-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('🔍 Testing Neon database connection...');

try {
  const sql = neon(DATABASE_URL);
  
  console.log('✅ Database client created');
  
  // Test basic query
  const result = await sql`SELECT NOW() as current_time`;
  console.log('✅ Database query successful:', result);
  
  // Check if users table exists
  const tableCheck = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    ) as table_exists;
  `;
  console.log('✅ Users table exists:', tableCheck[0].table_exists);
  
  // Check users in database
  const users = await sql`SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 10`;
  console.log(`✅ Found ${users.length} users in database:`);
  users.forEach(user => {
    console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`);
  });
  
} catch (error) {
  console.error('❌ Database test failed:', error.message);
  console.error('Stack:', error.stack);
}
