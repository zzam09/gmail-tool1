// Test script for multi-user functionality
const https = require('https');

const BASE_URL = 'http://localhost:3001';

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : require('http');
    const request = protocol.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          resolve({
            status: response.statusCode,
            data: JSON.parse(data)
          });
        } catch (error) {
          resolve({
            status: response.statusCode,
            data: data
          });
        }
      });
    });
    
    request.on('error', reject);
    request.setTimeout(5000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testAPI() {
  console.log('🧪 Testing Multi-User Gmail API...\n');

  try {
    // Test 1: Get all users
    console.log('1. Testing /api/users endpoint...');
    const usersResponse = await makeRequest(`${BASE_URL}/api/users`);
    const usersData = usersResponse.data;
    console.log('✅ Users API Status:', usersResponse.status);
    console.log('📊 Users found:', usersData.users?.length || 0);
    
    if (usersData.users?.length > 0) {
      console.log('👥 Sample user:', {
        name: usersData.users[0].name,
        email: usersData.users[0].email,
        hasTokens: usersData.users[0].hasTokens
      });

      // Test 2: Get messages for first user
      const firstUser = usersData.users[0];
      if (firstUser.hasTokens) {
        console.log('\n2. Testing messages endpoint for user:', firstUser.email);
        const messagesResponse = await makeRequest(`${BASE_URL}/api/admin/users/${firstUser.id}/messages`);
        const messagesData = messagesResponse.data;
        
        console.log('✅ Messages API Status:', messagesResponse.status);
        console.log('📧 Messages found:', messagesData.messages?.length || 0);
        
        if (messagesData.error) {
          console.log('❌ Error:', messagesData.error);
          if (messagesData.requiresReauth) {
            console.log('⚠️  User needs to re-authenticate');
          }
        } else if (messagesData.messages?.length > 0) {
          console.log('📨 Sample message:', {
            from: messagesData.messages[0].from,
            subject: messagesData.messages[0].subject,
            date: messagesData.messages[0].date
          });
        }
      } else {
        console.log('\n⚠️  User has no tokens - need to authenticate first');
      }
    } else {
      console.log('\n⚠️  No users found - need to authenticate at least one user');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPI();
