"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const THEMES = {
  light: {
    bg: "#f2f2f7", card: "#ffffff", sidebar: "#f8f8fa",
    text: "#000000", sub: "#6e6e73", border: "#e5e5ea",
    accent: "#007aff", topbar: "#ffffff", hover: "#f5f5f7",
    selected: "#e8f0fe", inputBg: "#e8e8ed", unread: "#007aff",
  },
  dark: {
    bg: "#0d0d0f", card: "#1c1c1e", sidebar: "#161618",
    text: "#ffffff", sub: "#8e8e93", border: "#2c2c2e",
    accent: "#0a84ff", topbar: "#1c1c1e", hover: "#2c2c2e",
    selected: "#1a3a5c", inputBg: "#2c2c2e", unread: "#0a84ff",
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

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { t, mode, toggle } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageDetail, setMessageDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [tokenStatus, setTokenStatus] = useState({});

  useEffect(() => {
    if (session) loadUsers();
  }, [session]);

  useEffect(() => {
    if (selectedUser) loadMessages();
  }, [selectedUser]);

  async function loadUsers() {
    try {
      const [usersRes, statusRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/debug/token-status')
      ]);
      
      const usersData = await usersRes.json();
      const statusData = await statusRes.json();
      
      console.log('Loaded users:', usersData);
      setUsers(usersData.users || []);
      
      if (statusData.success) {
        const statusMap = statusData.users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
        setTokenStatus(statusMap);
      }
      
      if (usersData.users?.length > 0 && !selectedUser) {
        // Find first user with a valid ID
        const validUser = usersData.users.find(user => user && user.id);
        if (validUser) {
          console.log('Setting selected user:', validUser);
          setSelectedUser(validUser);
        } else {
          console.warn('No users with valid IDs found');
        }
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  // Function to get detailed token status
  async function loadDetailedTokenStatus() {
    try {
      const res = await fetch('/api/debug/token-status');
      const data = await res.json();
      if (data.success) {
        return data.users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});
      }
    } catch (error) {
      console.error('Failed to load detailed token status:', error);
    }
    return {};
  }

  async function loadMessages(pageToken = null) {
    if (!selectedUser || !selectedUser.id) {
      console.log('No valid selected user, skipping message load');
      setMessages([]);
      setNextPageToken(null);
      return;
    }
    
    console.log('Loading messages for user:', selectedUser.email);
    setLoading(true);
    try {
      const url = `/api/admin/users/${selectedUser.id}/messages${pageToken ? `?pageToken=${pageToken}` : ""}`;
      console.log('Fetching from URL:', url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log('Messages response:', data);
      console.log('Response status:', res.status);
      
      if (data.error) {
        console.error('API Error:', data.error);
        if (data.requiresReauth) {
          alert(`User ${selectedUser.email} needs to re-authenticate. Please have them log in again.`);
        }
        return;
      }
      
      setMessages(prev => pageToken ? [...prev, ...(data.messages || [])] : (data.messages || []));
      setNextPageToken(data.nextPageToken || null);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openMessage(msg) {
    if (!selectedUser || !selectedUser.id) {
      console.error('No valid selected user for message detail');
      return;
    }
    
    setSelectedMessage(msg);
    setDetailLoading(true);
    setMessageDetail(null);
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/messages?id=${msg.id}`);
      const data = await res.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        return;
      }
      
      setMessageDetail(data);
    } catch (error) {
      console.error('Failed to load message detail:', error);
    } finally {
      setDetailLoading(false);
    }
  }

  async function deleteUser(userId, userEmail) {
    if (!confirm(`Are you sure you want to delete ${userEmail}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        console.log('User deleted successfully:', data.deletedUser);
        
        // Refresh users list
        await loadUsers();
        
        // Clear selected user if it was deleted
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
          setMessages([]);
          setMessageDetail(null);
          setSelectedMessage(null);
        }
        
        setDeleteConfirm(null);
      } else {
        console.error('Failed to delete user:', data.error);
        alert('Failed to delete user: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  }

  if (!session) {
    return (
      <div style={{ height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: THEMES.light.bg }}>
        <div style={{ color: THEMES.light.sub, fontSize: 14 }}>Please sign in to access admin dashboard</div>
      </div>
    );
  }

  return (
    <div style={{
      height: "100dvh", display: "flex", background: t.bg,
      color: t.text, fontFamily: "-apple-system, BlinkMacSystemFont, system-ui",
      overflow: "hidden",
    }}>
      {/* User Sidebar */}
      <div style={{
        width: 280, background: t.sidebar, borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column", padding: "16px",
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, padding: "8px 0 16px", color: t.text }}>
          👥 Users
        </div>
        
        {users.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: t.sub }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>👤</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>No Users Found</div>
            <div style={{ fontSize: 12, marginBottom: 16 }}>
              No users have authenticated yet.
            </div>
            <a 
              href="/"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: t.accent,
                color: "#fff",
                textDecoration: "none",
                borderRadius: 6,
                fontSize: 12,
              }}
            >
              Authenticate First User
            </a>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}>
            {users.filter(user => user && user.id).map(user => {
              const detailedStatus = tokenStatus[user.id];
              const statusIcon = detailedStatus?.icon || "❌";
              const statusText = detailedStatus?.status || "No Tokens";
              const statusColor = detailedStatus?.color || "#ff3b30";
              
              return (
              <div
                key={user.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px", borderRadius: 10, cursor: "pointer",
                  background: selectedUser?.id === user.id ? t.selected : "none",
                  marginBottom: 4,
                  position: "relative"
                }}
              >
                <div onClick={() => setSelectedUser(user)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar name={user.name} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: t.text }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: 12, color: t.sub, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </div>
                    <div style={{ fontSize: 11, color: statusColor }}>
                      {statusIcon} {statusText}
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm({ id: user.id, email: user.email });
                  }}
                  style={{
                    background: "#ff3b30",
                    border: "none",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 11,
                    cursor: "pointer",
                    color: "#fff",
                    fontWeight: 600,
                    opacity: 0.8,
                    transition: "opacity 0.2s"
                  }}
                  onMouseOver={(e) => e.target.style.opacity = "1"}
                  onMouseOut={(e) => e.target.style.opacity = "0.8"}
                >
                  🗑️
                </button>
              </div>
              );
            })}
          </div>
        )}
        
        <div style={{ paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
          <button onClick={toggle} style={{
            background: t.inputBg, border: "none", borderRadius: 8,
            padding: "8px 12px", fontSize: 13, cursor: "pointer", color: t.text, width: "100%",
          }}>
            {mode === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Message List */}
        <div style={{
          flex: "0 0 380px", background: t.bg, borderRight: `1px solid ${t.border}`,
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{
            padding: "16px", background: t.topbar, borderBottom: `1px solid ${t.border}`,
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: t.text }}>
              {selectedUser ? `${selectedUser.name}'s Inbox` : "Select a user"}
            </h2>
            {selectedUser && (
              <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>
                {selectedUser.email}
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>
                Loading messages...
              </div>
            ) : !selectedUser ? (
              <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>
                Select a user to view their emails
              </div>
            ) : messages.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", color: t.sub, fontSize: 14 }}>
                No messages found
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => openMessage(msg)}
                  style={{
                    display: "flex", gap: 12, padding: "12px 16px",
                    borderBottom: `1px solid ${t.border}`, cursor: "pointer",
                    background: selectedMessage?.id === msg.id ? t.selected : t.card,
                    borderLeft: msg.unread ? `3px solid ${t.accent}` : "3px solid transparent",
                  }}
                >
                  <Avatar name={extractName(msg.from)} />
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                      {extractName(msg.from)}
                    </div>
                    <div style={{ fontSize: 13, color: t.text, fontWeight: msg.unread ? 600 : 400 }}>
                      {msg.subject || "(no subject)"}
                    </div>
                    <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>
                      {formatDate(msg.date)}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {nextPageToken && (
              <div style={{ padding: 16, textAlign: "center" }}>
                <button onClick={() => loadMessages(nextPageToken)} style={{
                  background: t.inputBg, border: "none", borderRadius: 8,
                  padding: "8px 16px", fontSize: 12, cursor: "pointer", color: t.accent,
                }}>
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div style={{
          flex: 1, background: t.bg, display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {!selectedMessage ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: "100%", color: t.sub, fontSize: 14,
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
                Select an email to read
              </div>
            </div>
          ) : (
            <>
              <div style={{
                padding: "16px 20px", background: t.topbar,
                borderBottom: `1px solid ${t.border}`,
              }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>
                  {selectedMessage.subject || "(no subject)"}
                </h3>
                <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>
                  From: {extractName(selectedMessage.from)} • {formatDate(selectedMessage.date)}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                {detailLoading ? (
                  <div style={{ textAlign: "center", padding: 48, color: t.sub, fontSize: 14 }}>
                    Loading message...
                  </div>
                ) : messageDetail ? (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: messageDetail.body }} />
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  if (deleteConfirm) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000
      }}>
        <div style={{
          background: t.card, borderRadius: 12, padding: 24,
          maxWidth: 400, width: "90%", border: `1px solid ${t.border}`
        }}>
          <h3 style={{ margin: "0 0 16px", color: t.text, fontSize: 18 }}>
            Delete User?
          </h3>
          <p style={{ margin: "0 0 24px", color: t.sub, fontSize: 14, lineHeight: 1.5 }}>
            Are you sure you want to delete <strong>{deleteConfirm.email}</strong>? 
            This will permanently remove their account and all associated data. 
            This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                background: t.inputBg, border: `1px solid ${t.border}`,
                borderRadius: 8, padding: "10px 16px", fontSize: 14,
                cursor: "pointer", color: t.text
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => deleteUser(deleteConfirm.id, deleteConfirm.email)}
              style={{
                background: "#ff3b30", border: "none",
                borderRadius: 8, padding: "10px 16px", fontSize: 14,
                cursor: "pointer", color: "#fff", fontWeight: 600
              }}
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    );
  }
}
