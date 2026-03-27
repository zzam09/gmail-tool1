import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    const allUsers = await db.getAll();
    console.log('Database query result:', allUsers);
    
    return Response.json({
      success: true,
      userCount: allUsers.length,
      users: allUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        hasAccessToken: !!u.access_token,
        hasRefreshToken: !!u.refresh_token,
        createdAt: u.created_at
      }))
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return Response.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
