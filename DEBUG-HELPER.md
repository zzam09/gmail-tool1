# Debug Helper Documentation

This Gmail tool includes a comprehensive debugging helper system to quickly diagnose and fix issues.

## Quick Debug Commands

### Test Everything
```powershell
Invoke-RestMethod "http://localhost:3000/api/debug/system?test=everything" | ConvertTo-Json -Depth 10
```

### Test First User with Tokens
```powershell
Invoke-RestMethod "http://localhost:3000/api/debug/system?test=firstUser" | ConvertTo-Json -Depth 10
```

### Test Database Connection
```powershell
Invoke-RestMethod "http://localhost:3000/api/debug/system?test=database" | ConvertTo-Json -Depth 10
```

## Debug Endpoints

### `/api/debug/system`
Main system debugging endpoint with multiple test options.

### `/api/debug/db`
Tests database connection and lists all users.

### `/api/debug/params/[userId]`
Tests parameter extraction in dynamic routes.

### `/api/debug/admin-test`
Tests admin functionality with optional user ID.

## Common Issues and Solutions

### "No userId provided" Error
**Cause**: Next.js App Router treats route parameters as Promises.
**Solution**: Always `await params` before accessing properties.

```javascript
// ❌ Wrong
const { userId } = params;

// ✅ Correct  
const resolvedParams = await params;
const userId = resolvedParams?.userId;
```

### Admin Dashboard Not Loading Messages
**Cause**: Selected user doesn't have valid ID or tokens.
**Solution**: Check user selection and database state.

### Gmail API Errors
**Cause**: Expired or invalid access tokens.
**Solution**: User needs to re-authenticate.

## Debug Helper Class

The `DebugHelper` class in `/lib/debug-helper.js` provides:

- `testDatabaseConnection()` - Tests DB connectivity
- `testUserLookup(userId)` - Tests specific user retrieval
- `testGmailApi(user)` - Tests Gmail API access
- `diagnoseAdminMessages(userId)` - Complete diagnosis
- `createDebugEndpoint()` - Wraps handlers with debugging

## Usage Examples

### Quick System Test
```javascript
import { quickTests } from '@/lib/debug-helper';

// Test complete system
const results = await quickTests.testEverything();

// Test first user with tokens
const results = await quickTests.testFirstUserWithTokens();
```

### Custom Debug Endpoint
```javascript
import { DebugHelper } from '@/lib/debug-helper';

export const GET = DebugHelper.createDebugEndpoint('My Endpoint', async (req, { params }) => {
  // Your logic here
  return Response.json({ success: true });
});
```

## Environment Variables

Make sure these are set in `.env.local`:
- `DATABASE_URL` - Neon database connection
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - NextAuth URL (http://localhost:3000 for dev)

## Admin Dashboard Features

The admin dashboard at `/admin` provides:
- User management interface
- Message reading capabilities
- Token status monitoring
- Real-time debugging information

### Access Requirements
- User must be authenticated via NextAuth
- Users must have valid Gmail tokens in database
- Database connection must be working

## Troubleshooting Steps

1. **Check Database Connection**
   ```powershell
   Invoke-RestMethod "http://localhost:3000/api/debug/db"
   ```

2. **Check User Tokens**
   ```powershell
   Invoke-RestMethod "http://localhost:3000/api/debug/system?test=everything"
   ```

3. **Test Specific User**
   ```powershell
   Invoke-RestMethod "http://localhost:3000/api/admin/users/USER_ID/messages"
   ```

4. **Check Admin Dashboard**
   Navigate to `http://localhost:3000/admin` and watch browser console.

## Performance Monitoring

The debug helper includes performance logging:
- Request timing
- Database query performance
- Gmail API response times
- Error tracking

Use this information to identify bottlenecks and optimize performance.
