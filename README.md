# Gmail Tool - Multi-User Email Management System

A powerful Next.js application that allows multiple users to authenticate with Gmail and provides an admin dashboard to manage and read all users' emails.

## 🚀 Features

- **Multi-User Authentication**: Secure Google OAuth integration
- **Admin Dashboard**: Centralized admin panel to manage all users
- **Email Access**: Read and manage emails for any authenticated user
- **Real-time Updates**: Automatic detection of new users and emails
- **Token Management**: Secure storage and refresh of Gmail API tokens
- **Responsive Design**: Modern UI that works on all devices
- **Dark/Light Theme**: Built-in theme switching

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 with App Router
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Neon PostgreSQL
- **API**: Gmail API (Google Workspace)
- **Styling**: Custom CSS with responsive design
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- Google Cloud Project with Gmail API enabled
- Neon PostgreSQL database
- Google OAuth credentials

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd gmailtool
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your environment variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Neon Database
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
gmailtool/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── landing/           # Landing page
│   └── privacy/           # Privacy policy
├── lib/                   # Utility libraries
│   ├── db.js             # Database connection
│   ├── gmail.js          # Gmail API client
│   └── debug.js          # Debug utilities
├── public/                # Static assets
└── components/            # React components
```

## 🔧 Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### Neon Database Setup

1. Create a [Neon account](https://neon.tech/)
2. Create a new database
3. Copy the connection string to `.env.local`
4. The database schema will be created automatically

## 🎯 Usage

### For Regular Users

1. Visit the application
2. Click "Sign in with Google"
3. Grant Gmail permissions
4. Access your email inbox

### For Admins

1. Visit `/admin` after signing in
2. View all registered users
3. Select any user to read their emails
4. Monitor user authentication status

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your Vercel account to GitHub
3. Import the project
4. Add environment variables in Vercel dashboard
5. Deploy

### Environment Variables for Production

```env
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.vercel.app
DATABASE_URL=your_production_database_url
```

## 🔒 Security Features

- Secure OAuth 2.0 authentication
- Encrypted token storage
- Environment variable protection
- SQL injection prevention
- XSS protection with Next.js

## 📊 API Endpoints

### Authentication
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Gmail API
- `GET /api/gmail/messages` - Get user messages
- `GET /api/gmail/messages?id={id}` - Get specific message

### Admin API
- `GET /api/users` - List all users
- `GET /api/admin/users/{userId}/messages` - Get user messages (admin)

## 🐛 Troubleshooting

### Common Issues

1. **"No userId provided" error**
   - Ensure user has valid authentication tokens
   - Check database connection

2. **Gmail API errors**
   - Verify OAuth credentials are correct
   - Check Gmail API is enabled
   - User may need to re-authenticate

3. **Database connection issues**
   - Verify DATABASE_URL is correct
   - Check Neon database is running

### Debug Mode

For development, you can enable debug logging by checking the browser console and server logs.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue on GitHub.
