export async function POST(req) {
  console.log('🚪 Admin PIN logout');
  
  try {
    const response = Response.json({
      success: true,
      message: "Admin logged out successfully"
    });

    // Clear the admin session cookie
    response.headers.set('Set-Cookie', 'admin-session=; HttpOnly; Secure; SameSite=lax; Path=/; Max-Age=0');
    
    return response;
  } catch (error) {
    console.error('❌ Admin logout failed:', error);
    return Response.json({ 
      success: false, 
      error: "Logout failed: " + error.message 
    }, { status: 500 });
  }
}
