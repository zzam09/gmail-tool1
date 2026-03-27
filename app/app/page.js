"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

const THEMES = {
  light: {
    bg: "#f2f2f7", card: "#ffffff", sidebar: "#f8f8fa",
    text: "#000000", sub: "#6e6e73", border: "#e5e5ea",
    accent: "#007aff", topbar: "#ffffff", hover: "#f5f5f7",
    selected: "#e8f0fe", inputBg: "#e8e8ed", unread: "#007aff",
    sidebarActive: "#e8f0fe", sidebarText: "#000",
  },
  dark: {
    bg: "#0d0d0f", card: "#1c1c1e", sidebar: "#161618",
    text: "#ffffff", sub: "#8e8e93", border: "#2c2c2e",
    accent: "#0a84ff", topbar: "#1c1c1e", hover: "#2c2c2e",
    selected: "#1a3a5c", inputBg: "#2c2c2e", unread: "#0a84ff",
    sidebarActive: "#1a3a5c", sidebarText: "#fff",
  },
};

function useTheme() {
  const [mode, setMode] = useState("light");
  return { t: THEMES[mode], mode, toggle: () => setMode(m => m === "light" ? "dark" : "light") };
}

function Avatar({ name, size = 38 }) {
  const letter = (name || "?")[0].toUpperCase();
  const colors = ["#007aff","#34c759","#ff9500","#ff2d55","#af52de","#5ac8fa","#ff6b35","#30b0c7"];
  const color = colors[letter.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.38, flexShrink: 0,
    }}>{letter}</div>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (d.getFullYear() === now.getFullYear())
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "2-digit" });
}

function extractName(from = "") {
  const match = from.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : from.replace(/<.*?>/, "").trim() || from;
}

const NAV = [
  { id: "inbox", label: "Inbox", icon: "📥" },
  { id: "starred", label: "Starred", icon: "⭐" },
  { id: "sent", label: "Sent", icon: "📤" },
  { id: "trash", label: "Trash", icon: "🗑️" },
];

export default function App() {
  const { data: session, status } = useSession();
  const { t, mode, toggle } = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [activeNav, setActiveNav] = useState("inbox");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const iframeRef = useRef();

  // Responsive breakpoint
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { if (session) loadMessages(); }, [session]);

  async function loadMessages(pageToken = null) {
    pageToken ? setLoadingMore(true) : setLoading(true);
    const url = `/api/gmail/messages${pageToken ? `?pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setMessages(prev => pageToken ? [...prev, ...(data.messages || [])] : (data.messages || []));
    setNextPageToken(data.nextPageToken || null);
    pageToken ? setLoadingMore(false) : setLoading(false);
  }

  async function openEmail(msg) {
    setSelected(msg);
    setDetailLoading(true);
    setDetail(null);
    const res = await fetch(`/api/gmail/messages?id=${msg.id}`);
    const data = await res.json();
    setDetail(data);
    setDetailLoading(false);
  }

  const filtered = messages.filter(m =>
    m.subject?.toLowerCase().includes(search.toLowerCase()) ||
    m.from?.toLowerCase().includes(search.toLowerCase()) ||
    m.snippet?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter(m => m.unread).length;

  if (status === "loading") return (
    <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: t.bg }}>
      <div style={{ color: t.sub, fontSize: 14 }}>Loading...</div>
    </div>
  );

  if (!session) {
    // Redirect to landing page
    if (typeof window !== 'undefined') {
      window.location.href = '/landing';
      return null;
    }
    // Fallback for server-side rendering
    return (
      <div style={{
        height: "100dvh", display: "flex", alignItems: "center",
        justifyContent: "center", background: t.bg, padding: 24,
      }}>
        <div style={{ color: t.sub, fontSize: 14 }}>Redirecting...</div>
      </div>
    );
  }

  // Sidebar component
  const Sidebar = ({ mobile = false }) => (
    <div style={{
      width: mobile ? "100%" : 220,
      background: t.sidebar,
      borderRight: `1px solid ${t.border}`,
      display: "flex", flexDirection: "column",
      padding: "16px 8px",
      ...(mobile ? { position: "fixed", top: 0, left: 0, height: "100dvh", zIndex: 100, width: 260 } : {}),
    }}>
      {mobile && (
        <button onClick={() => setSidebarOpen(false)} style={{
          background: "none", border: "none", color: t.sub,
          fontSize: 22, cursor: "pointer", alignSelf: "flex-end", marginBottom: 8,
        }}>✕</button>
      )}
      <div style={{ fontWeight: 700, fontSize: 18, padding: "8px 12px 16px", color: t.text }}>
        📬 Mail
      </div>
      {NAV.map(n => (
        <button key={n.id} onClick={() => { setActiveNav(n.id); if (mobile) setSidebarOpen(false); }} style={{
          display: "flex", alignItems: "center", gap: 10,
          background: activeNav === n.id ? t.sidebarActive : "none",
          border: "none", borderRadius: 10, padding: "10px 12px",
          cursor: "pointer", color: activeNav === n.id ? t.accent : t.sidebarText,
          fontWeight: activeNav === n.id ? 600 : 400, fontSize: 14,
          width: "100%", textAlign: "left", marginBottom: 2,
        }}>
          <span>{n.icon}</span>
          <span>{n.label}</span>
          {n.id === "inbox" && unreadCount > 0 && (
            <span style={{
              marginLeft: "auto", background: t.accent, color: "#fff",
              borderRadius: 10, fontSize: 11, fontWeight: 700,
              padding: "1px 7px",
            }}>{unreadCount}</span>
          )}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ padding: "12px", borderTop: `1px solid ${t.border}` }}>
        <a 
          href="/privacy" 
          style={{
            display: "block", textAlign: "center", 
            color: t.sub, textDecoration: "none", 
            fontSize: 12, marginBottom: 4,
            padding: "6px 0", borderRadius: 6,
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => e.target.style.background = t.inputBg}
          onMouseOut={(e) => e.target.style.background = "none"}
        >
          Privacy Policy
        </a>
        <a 
          href="/terms" 
          style={{
            display: "block", textAlign: "center", 
            color: t.sub, textDecoration: "none", 
            fontSize: 12, marginBottom: 8,
            padding: "6px 0", borderRadius: 6,
            transition: "background 0.2s",
          }}
          onMouseOver={(e) => e.target.style.background = t.inputBg}
          onMouseOut={(e) => e.target.style.background = "none"}
        >
          Terms of Service
        </a>
        <div style={{ fontSize: 12, color: t.sub, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {session.user.email}
        </div>
        <button onClick={() => signOut()} style={{
          background: "none", border: `1px solid ${t.border}`,
          borderRadius: 8, padding: "7px 12px", fontSize: 13,
          cursor: "pointer", color: t.sub, width: "100%",
        }}>Sign out</button>
      </div>
    </div>
  );

  // Email list panel
  const EmailList = () => (
    <div style={{
      flex: isDesktop ? "0 0 340px" : 1,
      display: "flex", flexDirection: "column",
      borderRight: isDesktop ? `1px solid ${t.border}` : "none",
      background: t.bg, overflow: "hidden",
      // Hide list on mobile when detail is open
      ...((!isDesktop && selected) ? { display: "none" } : {}),
    }}>
      {/* List header */}
      <div style={{
        padding: "14px 16px 10px", background: t.topbar,
        borderBottom: `1px solid ${t.border}`, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          {!isDesktop && (
            <button onClick={() => setSidebarOpen(true)} style={{
              background: "none", border: "none", fontSize: 20,
              cursor: "pointer", color: t.text, padding: 0,
            }}>☰</button>
          )}
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: t.text }}>Inbox</span>
            {unreadCount > 0 && (
              <span style={{
                marginLeft: 8, background: t.accent, color: "#fff",
                borderRadius: 10, fontSize: 11, fontWeight: 700, padding: "2px 7px",
              }}>{unreadCount} unread</span>
            )}
          </div>
          <button onClick={toggle} style={{
            background: t.inputBg, border: "none", borderRadius: 8,
            padding: "6px 10px", fontSize: 14, cursor: "pointer", color: t.text,
          }}>{mode === "light" ? "🌙" : "☀️"}</button>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Search mail"
          style={{
            background: t.inputBg, borderRadius: 10, border: "none",
            padding: "8px 12px", width: "100%", fontSize: 14,
            color: t.text, outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Emails */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>Loading inbox...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>
            {search ? "No results" : "No emails"}
          </div>
        ) : (
          <>
            {filtered.map(msg => {
              const name = extractName(msg.from);
              const isSelected = selected?.id === msg.id;
              return (
                <div key={msg.id} onClick={() => openEmail(msg)} style={{
                  display: "flex", gap: 12, padding: "12px 16px",
                  borderBottom: `1px solid ${t.border}`,
                  background: isSelected ? t.selected : t.card,
                  cursor: "pointer", transition: "background 0.1s",
                  borderLeft: msg.unread ? `3px solid ${t.accent}` : "3px solid transparent",
                }}>
                  <Avatar name={name} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{
                        fontSize: 14, fontWeight: msg.unread ? 700 : 500, color: t.text,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180,
                      }}>{name}</span>
                      <span style={{ fontSize: 11, color: t.sub, flexShrink: 0 }}>{formatDate(msg.date)}</span>
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: msg.unread ? 600 : 400, color: t.text,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{msg.subject || "(no subject)"}</div>
                    <div style={{
                      fontSize: 12, color: t.sub,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{msg.snippet}</div>
                  </div>
                </div>
              );
            })}
            {nextPageToken && (
              <div style={{ padding: 20, textAlign: "center" }}>
                <button onClick={() => loadMessages(nextPageToken)} style={{
                  background: t.inputBg, border: "none", borderRadius: 10,
                  padding: "10px 24px", fontSize: 13, cursor: "pointer",
                  color: t.accent, fontWeight: 600,
                }}>
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Email detail panel
  const DetailPanel = () => (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      background: t.bg, overflow: "hidden",
      ...(!selected ? { alignItems: "center", justifyContent: "center" } : {}),
      // Hide on mobile when no selection
      ...(!isDesktop && !selected ? { display: "none" } : {}),
    }}>
      {!selected ? (
        <div style={{ color: t.sub, fontSize: 14, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
          Select an email to read
        </div>
      ) : (
        <>
          {/* Detail header */}
          <div style={{
            padding: "14px 20px", background: t.topbar,
            borderBottom: `1px solid ${t.border}`, flexShrink: 0,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            {!isDesktop && (
              <button onClick={() => setSelected(null)} style={{
                background: "none", border: "none", color: t.accent,
                fontSize: 15, cursor: "pointer", fontWeight: 500, padding: 0,
              }}>‹ Back</button>
            )}
            <span style={{ fontSize: 15, fontWeight: 600, color: t.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selected.subject || "(no subject)"}
            </span>
          </div>

          {/* Detail body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {detailLoading ? (
              <div style={{ textAlign: "center", padding: 48, color: t.sub, fontSize: 14 }}>
                Loading message...
              </div>
            ) : detail ? (
              <>
                <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: t.text, lineHeight: 1.3 }}>
                  {detail.subject || "(no subject)"}
                </h1>
                {/* Sender */}
                <div style={{
                  display: "flex", gap: 12, alignItems: "center",
                  background: t.card, borderRadius: 12, padding: "12px 16px",
                  marginBottom: 20, border: `1px solid ${t.border}`,
                }}>
                  <Avatar name={extractName(detail.from)} size={44} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: t.text }}>{extractName(detail.from)}</div>
                    <div style={{ fontSize: 12, color: t.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detail.from}</div>
                    <div style={{ fontSize: 12, color: t.sub, marginTop: 2 }}>{formatDate(detail.date)}</div>
                  </div>
                </div>
                {/* Body */}
                <div style={{ background: t.card, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden" }}>
                  {detail.isHtml ? (
                    <iframe
                      ref={iframeRef}
                      srcDoc={`<html><head><style>
                        body { font-family: -apple-system, system-ui; font-size: 15px;
                        line-height: 1.6; color: ${mode === "dark" ? "#fff" : "#1a1a1a"};
                        background: ${t.card}; padding: 20px; margin: 0; word-wrap: break-word; }
                        img { max-width: 100%; height: auto; border-radius: 8px; }
                        a { color: ${t.accent}; }
                        pre { white-space: pre-wrap; background: ${t.inputBg}; padding: 12px; border-radius: 8px; }
                      </style></head><body>${detail.body}</body></html>`}
                      style={{ width: "100%", border: "none", minHeight: 300 }}
                      onLoad={e => {
                        const h = e.target.contentDocument?.body?.scrollHeight;
                        if (h) e.target.style.height = (h + 40) + "px";
                      }}
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <pre style={{
                      padding: 20, margin: 0, whiteSpace: "pre-wrap",
                      fontSize: 14, lineHeight: 1.7, color: t.text,
                      fontFamily: "-apple-system, system-ui",
                    }}>{detail.body}</pre>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{
      height: "100dvh", display: "flex", background: t.bg,
      color: t.text, fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
      overflow: "hidden", position: "relative",
    }}>
      {/* Mobile sidebar overlay */}
      {!isDesktop && sidebarOpen && (
        <>
          <div onClick={() => setSidebarOpen(false)} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99,
          }} />
          <Sidebar mobile />
        </>
      )}

      {/* Desktop sidebar */}
      {isDesktop && <Sidebar />}

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <EmailList />
        <DetailPanel />
      </div>
    </div>
  );
}
