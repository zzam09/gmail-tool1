import { getServerSession } from "next-auth/next";

export async function GET() {
  try {
    console.log('🔍 Checking authentication status...');
    
    const session = await getServerSession();
    
    const status = {
      hasSession: !!session,
      user: session?.user || null,
      email: session?.user?.email || null,
      expires: session?.expires || null,
      accessToken: !!session?.accessToken,
      refreshToken: !!session?.refreshToken
    };
    
    console.log('Authentication status:', status);
    
    return Response.json({
      success: true,
      authentication: status,
      recommendations: {
        ifNoSession: "Sign in at http://localhost:3000 with Google OAuth",
        ifHasSession: "You should be able to access http://localhost:3000/admin",
        nextSteps: [
          "1. Check if browser has cookies blocked",
          "2. Try clearing browser cache",
          "3. Sign out and sign back in",
          "4. Check .env.local file exists"
        ]
      }
    });
  } catch (error) {
    console.error('❌ Auth status check failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
