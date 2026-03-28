export async function POST(req) {
  console.log('🔐 Simple auth test');
  
  try {
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    console.log('Request method:', req.method);
    
    const body = await req.text();
    console.log('Raw request body:', body);
    
    let parsed;
    try {
      parsed = JSON.parse(body);
      console.log('Parsed body:', parsed);
    } catch (e) {
      console.log('JSON parse error:', e.message);
      parsed = { pin: null };
    }
    
    const ADMIN_PIN = "12345";
    console.log('Expected PIN:', ADMIN_PIN);
    console.log('Received PIN:', parsed.pin);
    
    if (!parsed.pin) {
      return Response.json({ 
        success: false, 
        error: "PIN required" 
      }, { status: 400 });
    }
    
    if (parsed.pin !== ADMIN_PIN) {
      console.log('❌ Invalid PIN attempt');
      return Response.json({ 
        success: false, 
        error: "Invalid PIN" 
      }, { status: 401 });
    }
    
    console.log('✅ Valid PIN authentication');
    
    return Response.json({
      success: true,
      message: "Admin access granted",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Auth failed:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
