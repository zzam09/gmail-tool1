import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    console.log('=== ADMIN TEST DEBUG ===');
    
    // Test the exact same logic as the admin messages API
    const searchParams = new URL(req.url).searchParams;
    const testUserId = searchParams.get('testUserId');
    
    console.log('Test userId from query:', testUserId);
    
    // Get all users
    const users = await db.getAll();
    console.log('Available users:', users.map(u => ({ id: u.id, email: u.email, hasTokens: !!(u.access_token && u.refresh_token) })));
    
    // Test user lookup
    let testUser = null;
    if (testUserId) {
      testUser = await db.findById(testUserId);
      console.log('Test user lookup result:', testUser ? 'Found' : 'Not found');
    }
    
    // Test first user with tokens
    const firstUserWithTokens = users.find(u => u.access_token && u.refresh_token);
    console.log('First user with tokens:', firstUserWithTokens ? { id: firstUserWithTokens.id, email: firstUserWithTokens.email } : 'None');
    
    return Response.json({ 
      success: true,
      debug: {
        testUserId,
        testUser: testUser ? {
          id: testUser.id,
          email: testUser.email,
          hasTokens: !!(testUser.access_token && testUser.refresh_token)
        } : null,
        allUsers: users.map(u => ({
          id: u.id,
          email: u.email,
          hasTokens: !!(u.access_token && u.refresh_token)
        })),
        firstUserWithTokens: firstUserWithTokens ? {
          id: firstUserWithTokens.id,
          email: firstUserWithTokens.email
        } : null
      }
    });
  } catch (error) {
    console.error('Admin test failed:', error);
    return Response.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
