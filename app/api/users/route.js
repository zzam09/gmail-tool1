import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.getAll();
    console.log('Raw users from database:', users);
    
    const processedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      hasTokens: !!(user.access_token && user.refresh_token),
      createdAt: user.created_at
    }));
    
    console.log('Processed users for API response:', processedUsers);
    
    return Response.json({ 
      users: processedUsers
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
