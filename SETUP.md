# Multi-User Gmail Tool Setup Guide

## 🚀 Quick Setup

### 1. Environment Variables
Create a `.env.local` file in the root directory:

```bash
# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3001

# Neon Database (get from Neon console)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3001/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### 3. Neon Database Setup
1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new database
3. Copy the connection string to `.env.local`

### 4. Test the Setup

#### Step 1: Start the server
```bash
npm run dev
```

#### Step 2: Authenticate a user
1. Open `http://localhost:3001`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. This stores tokens in Neon database

#### Step 3: Access admin dashboard
1. Open `http://localhost:3001/admin`
2. View all authenticated users
3. Click users to see their emails
4. Read messages using stored tokens

## 🔍 Debugging

### Check database connection:
Visit `http://localhost:3001/api/test-db`

### Check users API:
Visit `http://localhost:3001/api/users`

### Common Issues:
1. **"User not found"** - No users in database. Authenticate first.
2. **Database connection failed** - Check DATABASE_URL in `.env.local`
3. **OAuth errors** - Check Google credentials and redirect URI

## 📱 Usage

### Admin Dashboard Features:
- **User List**: See all authenticated users
- **Switch Users**: Click any user to view their inbox
- **Read Emails**: Access full message content
- **Token Status**: See who has valid authentication

### API Endpoints:
- `GET /api/users` - List all users
- `GET /api/admin/users/[userId]/messages` - Get user's messages
- `GET /api/admin/users/[userId]/messages?id=[messageId]` - Get specific message

## 🔒 Security Notes

- Tokens are encrypted in Neon database
- Admin dashboard should be protected in production
- Consider adding role-based access control
- Users can revoke access by signing out
