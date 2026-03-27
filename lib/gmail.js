import { google } from "googleapis";
import { debugLog } from "./debug.js";

export function getGmailClient(accessToken, refreshToken) {
  debugLog('Creating Gmail client', {
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length,
    hasRefreshToken: !!refreshToken,
    refreshTokenLength: refreshToken?.length
  });

  if (!accessToken) {
    throw new Error("Access token is required");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/auth/callback/google"
  );

  debugLog('OAuth2 client created', {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET
  });

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  debugLog('Credentials set on OAuth2 client');

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  debugLog('Gmail client created successfully');
  
  return gmail;
}
