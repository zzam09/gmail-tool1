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

export default function TermsOfService() {
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: "0 0 12px", color: t.text }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 16, color: t.sub, margin: 0, lineHeight: 1.6 }}>
            Simple terms for using our service responsibly.
          </p>
        </div>

        {/* Terms Content */}
        <div style={{
          background: t.card, borderRadius: 16, padding: "32px",
          border: `1px solid ${t.border}`,
        }}>
          <div style={{ fontSize: 16, lineHeight: 1.7, color: t.text }}>
            
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              User Responsibility
            </h2>
            <p style={{ marginBottom: 24 }}>
              Users are responsible for their usage of this service. You must use this application in compliance with all applicable laws and Google's terms of service.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              No Abuse Policy
            </h2>
            <p style={{ marginBottom: 24 }}>
              No abuse of the service is permitted. This includes but is not limited to spam, unauthorized access, or any malicious use of the application.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              Service Provided "As Is"
            </h2>
            <p style={{ marginBottom: 24 }}>
              This service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of this application.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              Google Terms
            </h2>
            <p style={{ marginBottom: 24 }}>
              By using this service, you agree to comply with Google's terms of service and API usage policies.
            </p>

            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: t.text }}>
              Contact
            </h2>
            <p style={{ marginBottom: 16 }}>
              Questions about these terms? Contact: <strong>actionszam@gmail.com</strong>
            </p>

          </div>
        </div>

        {/* Navigation */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a 
              href="/" 
              style={{
                display: "inline-flex", alignItems: "center",
                background: t.accent, color: "#fff", textDecoration: "none",
                borderRadius: 12, padding: "12px 24px", fontSize: 15,
                fontWeight: 600, transition: "opacity 0.2s",
              }}
              onMouseOver={(e) => e.target.style.opacity = "0.8"}
              onMouseOut={(e) => e.target.style.opacity = "1"}
            >
              ← Home
            </a>
            <a 
              href="/privacy" 
              style={{
                display: "inline-flex", alignItems: "center",
                background: "rgba(0,0,0,0.1)", color: t.text, textDecoration: "none",
                borderRadius: 12, padding: "12px 24px", fontSize: 15,
                fontWeight: 600, transition: "background 0.2s", border: `1px solid ${t.border}`,
              }}
              onMouseOver={(e) => e.target.style.background = "rgba(0,0,0,0.2)"}
              onMouseOut={(e) => e.target.style.background = "rgba(0,0,0,0.1)"}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
