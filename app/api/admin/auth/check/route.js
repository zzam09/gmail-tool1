export async function GET(req) {
  console.log('🔍 Checking admin PIN session');
  
  try {
    const cookieHeader = req.headers.get('cookie');
    if (!cookieHeader) {
      return Response.json({ authenticated: false }, { status: 200 });
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const adminSession = cookies['admin-session'];
    
    if (!adminSession) {
      return Response.json({ authenticated: false }, { status: 200 });
    }

    try {
      const session = JSON.parse(decodeURIComponent(adminSession));
      
      // Check if session is still valid (1 hour)
      const sessionAge = Date.now() - new Date(session.timestamp).getTime();
      const maxAge = 60 * 60 * 1000; // 1 hour
      
      if (sessionAge > maxAge) {
        return Response.json({ authenticated: false }, { status: 200 });
      }

      console.log('✅ Valid admin session found');
      return Response.json({ 
        authenticated: true,
        session: {
          timestamp: session.timestamp
        }
      });
    } catch (parseError) {
      console.error('Failed to parse admin session:', parseError);
      return Response.json({ authenticated: false }, { status: 200 });
    }
  } catch (error) {
    console.error('❌ Session check failed:', error);
    return Response.json({ authenticated: false }, { status: 500 });
  }
}
