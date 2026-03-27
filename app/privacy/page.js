"use client";
import { useState } from "react";

const THEMES = {
  light: {
    bg: "#f2f2f7", card: "#ffffff", text: "#000000", sub: "#6e6e73", 
    border: "#e5e5ea", accent: "#007aff", topbar: "#ffffff",
  },
  dark: {
    bg: "#0d0d0f", card: "#1c1c1e", text: "#ffffff", sub: "#8e8e93", 
    border: "#2c2c2e", accent: "#0a84ff", topbar: "#1c1c1e",
  },
};

function useTheme() {
  const [mode, setMode] = useState("light");
  return { t: THEMES[mode], mode, toggle: () => setMode(m => m === "light" ? "dark" : "light") };
}

export default function PrivacyPolicy() {
  const { t, mode, toggle } = useTheme();

  return (
    <div style={{
      minHeight: "100dvh", background: t.bg, color: t.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
      padding: "20px 0",
    }}>
      <div style={{
        maxWidth: 800, margin: "0 auto", padding: "0 20px",
      }}>
        {/* Header */}
        <div style={{
          background: t.card, borderRadius: 16, padding: "32px",
          marginBottom: 24, border: `1px solid ${t.border}`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px", color: t.text }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 16, color: t.sub, margin: 0, lineHeight: 1.6 }}>
            Your privacy is important to us. Here's how we handle your data.
          </p>
        </div>

        {/* Policy Content */}
        <div style={{
          background: t.card, borderRadius: 16, padding: "32px",
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ fontSize: 16, lineHeight: 1.7, color: t.text }}>
            
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              Data Access
            </h2>
            <p style={{ marginBottom: 24 }}>
              This application accesses Google user data (such as Gmail) solely to provide its core functionality.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              Data Storage & Sharing
            </h2>
            <p style={{ marginBottom: 24 }}>
              We do not store, share, or sell user data. All data is processed in real-time and only used to perform user-requested actions.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              Third-Party Transfers
            </h2>
            <p style={{ marginBottom: 24 }}>
              We do not transfer user data to third parties.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              Contact
            </h2>
            <p style={{ marginBottom: 16 }}>
              If you have any questions, contact: <strong>actionszam@gmail.com</strong>
            </p>

          </div>
        </div>

        {/* Back to App */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <a 
            href="/" 
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: t.accent, color: "#fff", textDecoration: "none",
              borderRadius: 12, padding: "12px 24px", fontSize: 15,
              fontWeight: 600, transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => e.target.style.opacity = "0.8"}
            onMouseOut={(e) => e.target.style.opacity = "1"}
          >
            ← Back to App
          </a>
        </div>
      </div>
    </div>
  );
}
