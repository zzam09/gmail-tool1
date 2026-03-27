import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await db.getAll();
    
    return Response.json({ 
      success: true,
      message: "Database connection successful",
      userCount: result.length,
      users: result.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        hasTokens: !!(u.access_token && u.refresh_token)
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
