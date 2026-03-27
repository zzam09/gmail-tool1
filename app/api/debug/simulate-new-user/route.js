import { db } from "@/lib/db";

export async function POST(req) {
  try {
    // Simulate a new user signing in
    const mockUser = {
      id: "123456789012345678901", // Google ID
      name: "Test User",
      email: "testuser@gmail.com",
      accessToken: "mock_access_token_12345",
      refreshToken: "mock_refresh_token_67890"
    };

    console.log('🔄 Simulating new user registration:', mockUser.email);

    // Store user in database (same as NextAuth callback)
    const result = await db.upsert({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      accessToken: mockUser.accessToken,
      refreshToken: mockUser.refreshToken
    });

    console.log('✅ New user stored in database:', result);

    // Test if admin can see this user
    const allUsers = await db.getAll();
    const newUser = allUsers.find(u => u.email === mockUser.email);

    return Response.json({
      success: true,
      message: "New user simulation completed",
      newUser: {
        id: newUser?.id,
        name: newUser?.name,
        email: newUser?.email,
        hasTokens: !!(newUser?.access_token && newUser?.refresh_token),
        createdAt: newUser?.created_at
      },
      totalUsers: allUsers.length,
      adminCanAccess: !!(newUser?.access_token && newUser?.refresh_token)
    });
  } catch (error) {
    console.error('❌ New user simulation failed:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
