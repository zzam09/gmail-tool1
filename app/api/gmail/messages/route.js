import { getServerSession } from "next-auth";
import { getGmailClient } from "@/lib/gmail";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Not authenticated" }, { status: 401 });

  const gmail = getGmailClient(session.accessToken, session.refreshToken);
  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get("pageToken") || undefined;
  const messageId = searchParams.get("id");

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
        // Prefer html, fallback to plain
        const html = payload.parts.find(p => p.mimeType === "text/html");
        const plain = payload.parts.find(p => p.mimeType === "text/plain");
        const part = html || plain;
        if (part?.body?.data) {
          return Buffer.from(part.body.data, "base64").toString("utf-8");
        }
        // Nested parts
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
      };
    })
  );

  return Response.json({ messages, nextPageToken: list.data.nextPageToken });
}
