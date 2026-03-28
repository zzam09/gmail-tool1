import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const userId = '107949605543180750535'; // First user ID

async function testAdminAPI() {
  try {
    console.log('Testing admin messages API...');
    console.log('Using userId:', userId);
    
    const response = await fetch(`http://localhost:3001/api/admin/users/${userId}/messages`);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAdminAPI();
