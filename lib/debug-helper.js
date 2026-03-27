import { db } from "./db.js";

export class DebugHelper {
  static async testDatabaseConnection() {
    try {
      console.log('🔍 Testing database connection...');
      const users = await db.getAll();
      return {
        success: true,
        userCount: users.length,
        users: users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          hasTokens: !!(u.access_token && u.refresh_token)
        }))
      };
    } catch (error) {
      console.error('❌ Database test failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testUserLookup(userId) {
    try {
      console.log(`🔍 Looking up user: ${userId}`);
      const user = await db.findById(userId);
      return {
        success: true,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          hasTokens: !!(user.access_token && user.refresh_token)
        } : null
      };
    } catch (error) {
      console.error('❌ User lookup failed:', error);
      return { success: false, error: error.message };
    }
  }

  static async testGmailApi(user) {
    try {
      if (!user || !user.access_token) {
        return { success: false, error: 'No valid user or tokens' };
      }

      console.log('🔍 Testing Gmail API for user:', user.email);
      const { getGmailClient } = await import('./gmail.js');
      const gmail = getGmailClient(user.access_token, user.refresh_token);
      
      const list = await gmail.users.messages.list({
        userId: "me",
        maxResults: 5,
      });

      return {
        success: true,
        messageCount: list.data.messages?.length || 0,
        messages: list.data.messages || []
      };
    } catch (error) {
      console.error('❌ Gmail API test failed:', error);
      return { success: false, error: error.message };
    }
  }

  static logRequestDetails(req, params = null) {
    console.log('🔍 === REQUEST DEBUG ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    if (params) {
      console.log('Params:', params);
    }
    console.log('=== END DEBUG ===');
  }

  static async diagnoseAdminMessages(userId) {
    console.log('🔍 === ADMIN MESSAGES DIAGNOSIS ===');
    
    // 1. Test database
    const dbTest = await this.testDatabaseConnection();
    console.log('Database test:', dbTest);
    
    // 2. Test specific user
    const userTest = await this.testUserLookup(userId);
    console.log('User test:', userTest);
    
    // 3. Test Gmail API if user exists
    let gmailTest = { success: false, error: 'No user to test' };
    if (userTest.success && userTest.user) {
      const fullUser = await db.findById(userId);
      gmailTest = await this.testGmailApi(fullUser);
    }
    console.log('Gmail test:', gmailTest);
    
    console.log('=== END DIAGNOSIS ===');
    
    return {
      database: dbTest,
      user: userTest,
      gmail: gmailTest
    };
  }

  static createDebugEndpoint(endpointName, handler) {
    return async (req, { params }) => {
      try {
        this.logRequestDetails(req, params);
        const result = await handler(req, { params });
        console.log(`✅ ${endpointName} success`);
        return result;
      } catch (error) {
        console.error(`❌ ${endpointName} failed:`, error);
        return Response.json({
          success: false,
          error: error.message,
          stack: error.stack
        }, { status: 500 });
      }
    };
  }
}

// Quick test functions
export const quickTests = {
  async testEverything() {
    console.log('🚀 Running complete system test...');
    const results = await DebugHelper.diagnoseAdminMessages('117187910537722196892');
    return results;
  },

  async testFirstUserWithTokens() {
    const dbTest = await DebugHelper.testDatabaseConnection();
    if (dbTest.success && dbTest.users.length > 0) {
      const firstUserWithTokens = dbTest.users.find(u => u.hasTokens);
      if (firstUserWithTokens) {
        return await DebugHelper.diagnoseAdminMessages(firstUserWithTokens.id);
      }
    }
    return { error: 'No users with tokens found' };
  }
};
