import { db } from "@/lib/db";

export async function GET() {
  try {
    // Simulate what happens when a new user signs up
    const mockNewUser = {
      id: "test_new_user_" + Date.now(),
      name: "Test New User",
      email: "testnewuser@example.com",
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token"
    };

    console.log('🧪 Simulating new user signup:', mockNewUser);

    // This is what happens during normal signup
    const storedUser = await db.upsert(mockNewUser);
    
    // Check if admin can see this user
    const allUsers = await db.getAll();
    const adminCanSee = allUsers.find(u => u.id === mockNewUser.id);

    return Response.json({
      success: true,
      mockUser: mockNewUser,
      storedUser: {
        id: storedUser.id,
        name: storedUser.name,
        email: storedUser.email,
        hasTokens: !!(storedUser.access_token && storedUser.refresh_token)
      },
      adminCanSeeUser: !!adminCanSee,
      totalUsersInDb: allUsers.length,
      message: "New user would be immediately visible to admin"
    });
  } catch (error) {
    console.error('New user test failed:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
