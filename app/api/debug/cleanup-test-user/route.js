import { db } from "@/lib/db";

export async function DELETE() {
  try {
    console.log('🧹 Cleaning up test user...');
    
    // Delete the test user we created
    const result = await db.delete('testuser@gmail.com');
    
    // Show remaining users
    const users = await db.getAll();
    
    return Response.json({
      success: true,
      message: "Test user cleanup completed",
      deletedUser: result,
      remainingUsers: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        hasTokens: !!(u.access_token && u.refresh_token)
      }))
    });
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
