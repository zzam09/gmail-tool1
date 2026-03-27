import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log('🔍 Checking detailed token status...');
    
    const users = await db.getAll();
    
    const detailedStatus = users.map(user => {
      const hasAccessToken = !!user.access_token;
      const hasRefreshToken = !!user.refresh_token;
      const hasBothTokens = hasAccessToken && hasRefreshToken;
      const accessTokenLength = user.access_token?.length || 0;
      const refreshTokenLength = user.refresh_token?.length || 0;
      
      let status = "No Tokens";
      let color = "#ff3b30"; // Red
      let icon = "❌";
      
      if (hasBothTokens) {
        status = "Authenticated";
        color = "#34c759"; // Green
        icon = "✅";
      } else if (hasAccessToken || hasRefreshToken) {
        status = "Partial Tokens";
        color = "#ff9500"; // Orange
        icon = "⚠️";
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        hasTokens: hasBothTokens,
        hasAccessToken,
        hasRefreshToken,
        accessTokenLength,
        refreshTokenLength,
        status,
        color,
        icon,
        createdAt: user.created_at,
        needsReauth: !hasBothTokens
      };
    });
    
    return Response.json({
      success: true,
      users: detailedStatus,
      summary: {
        totalUsers: users.length,
        authenticated: detailedStatus.filter(u => u.status === "Authenticated").length,
        partialTokens: detailedStatus.filter(u => u.status === "Partial Tokens").length,
        noTokens: detailedStatus.filter(u => u.status === "No Tokens").length
      }
    });
  } catch (error) {
    console.error('❌ Token status check failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
