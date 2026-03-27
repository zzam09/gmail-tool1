import { getGmailClient } from "@/lib/gmail";
import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    // In Next.js App Router, params might be a Promise
    const resolvedParams = await params;
    const userId = resolvedParams?.userId || resolvedParams?.['userId'];
    
    if (!userId || userId === 'undefined' || userId === '') {
      console.log('❌ No userId provided');
      return Response.json({ error: "No userId provided" }, { status: 400 });
    }
    
    console.log('Looking up user with ID:', userId);
    
    const { searchParams } = new URL(req.url);
    const pageToken = searchParams.get("pageToken") || undefined;
    const messageId = searchParams.get("id");

    // Get user from database
    console.log('Querying database...');
    const user = await db.findById(userId);
    console.log('Database query result:', user ? 'User found' : 'User not found');
    
    if (user) {
      console.log('User details:', {
        id: user.id,
        name: user.name,
        email: user.email,
        hasAccessToken: !!user.access_token,
        hasRefreshToken: !!user.refresh_token
      });
    }
    
    if (!user) {
      console.log('❌ User not found in database');
      
      // Let's also check what users exist
      const allUsers = await db.getAll();
      console.log('Available users in database:');
      allUsers.forEach(u => {
        console.log(`  - ID: ${u.id}, Email: ${u.email}`);
      });
      
      return Response.json({ 
        error: "User not found", 
        userId: userId,
        availableUserIds: allUsers.map(u => u.id)
      }, { status: 404 });
    }

    if (!user.access_token) {
      return Response.json({ error: "User has no valid tokens" }, { status: 401 });
    }

    const gmail = getGmailClient(user.access_token, user.refresh_token);

    // Single full message fetch
    if (messageId) {
      const msg = await gmail.users.messages.get({
        userId: "me",
        id: messageId,
        format: "full",
      });

      const headers = msg.data.payload.headers;
      const get = (name) => headers.find(h => h.name === name)?.value || "";

      // Decode body recursively
      function getBody(payload) {
        if (payload.body?.data) {
          return Buffer.from(payload.body.data, "base64").toString("utf-8");
        }
        if (payload.parts) {
          const html = payload.parts.find(p => p.mimeType === "text/html");
          const plain = payload.parts.find(p => p.mimeType === "text/plain");
          const part = html || plain;
          if (part?.body?.data) {
            return Buffer.from(part.body.data, "base64").toString("utf-8");
          }
          for (const p of payload.parts) {
            const result = getBody(p);
            if (result) return result;
          }
        }
        return msg.data.snippet || "";
      }

      const body = getBody(msg.data.payload);
      const isHtml = body.includes("<html") || body.includes("<div") || body.includes("<p");

      return Response.json({
        id: msg.data.id,
        from: get("From"),
        to: get("To"),
        subject: get("Subject"),
        date: get("Date"),
        body,
        isHtml,
        snippet: msg.data.snippet,
        userEmail: user.email,
        userName: user.name
      });
    }

    // List messages
    const list = await gmail.users.messages.list({
      userId: "me",
      maxResults: 50,
      pageToken,
    });

    const messages = await Promise.all(
      (list.data.messages || []).map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "metadata",
          metadataHeaders: ["From", "Subject", "Date"],
        });
        const headers = detail.data.payload.headers;
        const get = (name) => headers.find(h => h.name === name)?.value || "";
        return {
          id: msg.id,
          from: get("From"),
          subject: get("Subject"),
          date: get("Date"),
          snippet: detail.data.snippet,
          unread: detail.data.labelIds?.includes("UNREAD"),
          userEmail: user.email,
          userName: user.name
        };
      })
    );

    return Response.json({ 
      messages, 
      nextPageToken: list.data.nextPageToken,
      currentUser: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Failed to fetch user messages:', error);
    
    // Handle token refresh errors
    if (error.message?.includes('invalid_grant') || error.message?.includes('401')) {
      return Response.json({ 
        error: "Tokens expired. Please re-authenticate user.",
        requiresReauth: true 
      }, { status: 401 });
    }
    
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
