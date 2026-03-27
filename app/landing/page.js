"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";

const THEMES = {
  light: {
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    card: "#ffffff", text: "#1a202c", sub: "#4a5568", 
    border: "#e2e8f0", accent: "#667eea", topbar: "#ffffff",
    overlay: "rgba(255,255,255,0.1)",
  },
  dark: {
    bg: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
    card: "#2d3748", text: "#f7fafc", sub: "#cbd5e0", 
    border: "#4a5568", accent: "#667eea", topbar: "#1a202c",
    overlay: "rgba(0,0,0,0.2)",
  },
};

function useTheme() {
  const [mode, setMode] = useState("light");
  return { t: THEMES[mode], mode, toggle: () => setMode(m => m === "light" ? "dark" : "light") };
}

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
];

const INSPIRATIONS = [
  { icon: "🚀", title: "Innovation", desc: "Push boundaries and create the future" },
  { icon: "💡", title: "Creativity", desc: "Transform ideas into reality" },
  { icon: "🎯", title: "Focus", desc: "Channel your energy toward what matters" },
  { icon: "⚡", title: "Impact", desc: "Make a difference in everything you do" },
];

export default function LandingPage() {
  const { t, mode, toggle } = useTheme();
  const [currentQuote, setCurrentQuote] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = () => {
      setCurrentQuote(prev => (prev + 1) % QUOTES.length);
    };
    const timer = setInterval(interval, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{
      minHeight: "100dvh", background: t.bg, color: t.text,
      fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
      position: "relative", overflow: "hidden",
    }}>
      {/* Animated background elements */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: t.bg,
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "10%", width: 200, height: 200,
          background: t.overlay, borderRadius: "50%", filter: "blur(40px)",
          animation: "float 6s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "20%", right: "15%", width: 150, height: 150,
          background: t.overlay, borderRadius: "50%", filter: "blur(30px)",
          animation: "float 8s ease-in-out infinite reverse",
        }} />
      </div>

      {/* Navigation */}
      <nav style={{
        position: "relative", zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 40px",
      }}>
        <div style={{
          fontSize: 24, fontWeight: 700, color: "#fff",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span>✉️</span>
          <span>Gmail Tool</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a 
            href="/privacy" 
            style={{
              color: "#fff", textDecoration: "none", fontSize: 14,
              opacity: 0.9, transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => e.target.style.opacity = "1"}
            onMouseOut={(e) => e.target.style.opacity = "0.9"}
          >
            Privacy
          </a>
          <a 
            href="/terms" 
            style={{
              color: "#fff", textDecoration: "none", fontSize: 14,
              opacity: 0.9, transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => e.target.style.opacity = "1"}
            onMouseOut={(e) => e.target.style.opacity = "0.9"}
          >
            Terms
          </a>
          <button onClick={toggle} style={{
            background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: 8, padding: "8px 12px", fontSize: 14,
            cursor: "pointer", color: "#fff", backdropFilter: "blur(10px)",
          }}>
            {mode === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ position: "relative", zIndex: 10, padding: "40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {/* Hero Section */}
          <div style={{
            textAlign: "center", marginBottom: 80,
            animation: "fadeInUp 1s ease-out",
          }}>
            <h1 className="clamp-text" style={{
              fontWeight: 800,
              color: "#fff", marginBottom: 24,
              lineHeight: 1.2, textShadow: "0 2px 20px rgba(0,0,0,0.3)",
            }}>
              Elevate Your
              <br />
              Digital Experience
            </h1>
            <p className="clamp-subtext" style={{
              color: "rgba(255,255,255,0.9)",
              marginBottom: 40, lineHeight: 1.6,
              maxWidth: 600, margin: "0 auto 40px",
            }}>
              Where innovation meets inspiration. Transform the way you interact with technology.
            </p>
            <div style={{
              display: "flex", gap: 16, justifyContent: "center",
              flexWrap: "wrap",
            }}>
              <button 
                onClick={() => signIn("google", {}, { prompt: "select_account" })}
                style={{
                  background: "#fff", color: t.accent, border: "none",
                  borderRadius: 12, padding: "16px 32px", fontSize: 16,
                  fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
                }}
              >
                Continue with Google
              </button>
              <a 
                href="/privacy"
                style={{
                  display: "inline-flex", alignItems: "center",
                  background: "rgba(255,255,255,0.2)", color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 12, padding: "16px 32px", fontSize: 16,
                  fontWeight: 600, cursor: "pointer", textDecoration: "none",
                  backdropFilter: "blur(10px)",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.3)"}
                onMouseOut={(e) => e.target.style.background = "rgba(255,255,255,0.2)"}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Inspirations Grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24, marginBottom: 80,
          }}>
            {INSPIRATIONS.map((item, index) => (
              <div key={index} style={{
                background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)",
                borderRadius: 16, padding: 32, textAlign: "center",
                border: "1px solid rgba(255,255,255,0.2)",
                transition: "transform 0.3s, background 0.3s",
                animation: `fadeInUp 0.8s ease-out ${index * 0.1}s both`,
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-8px)";
                e.target.style.background = "rgba(255,255,255,0.15)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Motivational Quote */}
          <div style={{
            textAlign: "center", padding: "60px 20px",
            animation: "fadeIn 2s ease-out",
          }}>
            <div className="clamp-quote" style={{
              fontWeight: 300,
              color: "rgba(255,255,255,0.9)", lineHeight: 1.6,
              marginBottom: 16, fontStyle: "italic",
              maxWidth: 800, margin: "0 auto 16px",
            }}>
              "{QUOTES[currentQuote].text}"
            </div>
            <div style={{
              fontSize: 16, color: "rgba(255,255,255,0.7)",
              fontWeight: 500,
            }}>
              — {QUOTES[currentQuote].author}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @function clamp($min, $viewport-unit, $max) {
          return max($min, min($max, $viewport-unit * 1vw));
        }
        
        /* Fallback clamp for browsers that don't support CSS clamp() */
        .clamp-text {
          font-size: 48px;
          font-size: clamp(48px, 4vw, 72px);
        }
        
        .clamp-subtext {
          font-size: 18px;
          font-size: clamp(18px, 2vw, 24px);
        }
        
        .clamp-quote {
          font-size: 24px;
          font-size: clamp(24px, 3vw, 32px);
        }
      `}</style>
    </div>
  );
}
