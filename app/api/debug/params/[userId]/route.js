export async function GET(req, { params }) {
  try {
    console.log('=== PARAMS TEST ===');
    console.log('Full params object:', JSON.stringify(params, null, 2));
    console.log('typeof params:', typeof params);
    console.log('params keys:', Object.keys(params));
    console.log('params.userId:', params?.userId);
    console.log('params["userId"]:', params?.['userId']);
    
    // Test different extraction methods
    const userId1 = params?.userId;
    const userId2 = params?.['userId'];
    const userId3 = params.userId;
    
    return Response.json({ 
      success: true,
      debug: {
        params,
        typeof: typeof params,
        keys: Object.keys(params),
        userId1,
        userId2,
        userId3,
        extractedUserId: userId1 || userId2 || userId3
      }
    });
  } catch (error) {
    console.error('Params test failed:', error);
    return Response.json({ 
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
