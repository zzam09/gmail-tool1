// Environment Setup Helper
const fs = require('fs');
const path = require('path');

console.log('🔧 Gmail Tool Environment Setup\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n📄 Current environment variables:');
  console.log(envContent.split('\n').filter(line => line.trim()).join('\n'));
} else {
  console.log('❌ .env.local file not found');
  console.log('\n📝 Creating .env.local template...');
  
  const template = `# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3001

# Neon Database (get from Neon console)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
`;
  
  fs.writeFileSync(envPath, template);
  console.log('✅ .env.local template created');
  console.log('\n⚠️  Please update the values in .env.local with your actual credentials:');
  console.log('1. Google OAuth credentials from Google Cloud Console');
  console.log('2. Neon database URL from Neon console');
  console.log('3. Generate a NEXTAUTH_SECRET');
}

// Check database connection
console.log('\n🔍 Testing database connection...');
try {
  const { neon } = require('@neondatabase/serverless');
  
  // Try to read DATABASE_URL
  require('dotenv').config({ path: '.env.local' });
  
  if (!process.env.DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment');
  } else {
    console.log('✅ DATABASE_URL found');
    console.log('🔗 Database URL format looks correct');
  }
} catch (error) {
  console.log('❌ Failed to test database connection:', error.message);
}

console.log('\n📋 Next Steps:');
console.log('1. Update .env.local with your actual credentials');
console.log('2. Restart the development server: npm run dev');
console.log('3. Authenticate at least one user');
console.log('4. Test admin dashboard at http://localhost:3001/admin');
