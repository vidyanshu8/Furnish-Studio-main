import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

// ─── Chatbot Component ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are DecoView Assistant, a knowledgeable and elegant interior design and furniture advisor. 
You help users with:
- Furniture selection, placement, and styling advice
- Color palette and material recommendations
- Room layout and space planning tips
- Design style guidance (modern, minimalist, Scandinavian, bohemian, etc.)
- Budget-conscious design suggestions

Keep responses concise, warm, and expert. Use design terminology naturally. 
Format lists with bullet points when helpful. Keep answers focused and actionable.`;

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "18px 18px 18px 4px", width: "fit-content", border: "1px solid rgba(255,255,255,0.08)" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "rgba(180,160,255,0.7)",
        animation: "chatPulse 1.4s ease-in-out infinite",
        animationDelay: `${i * 0.2}s`,
        display: "block"
      }} />
    ))}
  </div>
);

const ChatAvatar = ({ sender }) => (
  <div style={{
    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
    background: sender === "bot"
      ? "linear-gradient(135deg, #7c6df0 0%, #a78bfa 100%)"
      : "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 600, color: "#fff",
    border: sender === "bot" ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.1)",
    boxShadow: sender === "bot" ? "0 0 12px rgba(124,109,240,0.3)" : "none"
  }}>
    {sender === "bot" ? "D" : "U"}
  </div>
);

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";
  return (
    <div style={{
      display: "flex", gap: 10, alignItems: "flex-end",
      flexDirection: isUser ? "row-reverse" : "row",
      animation: "chatFadeIn 0.25s ease-out"
    }}>
      <ChatAvatar sender={message.sender} />
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 4 }}>
        <div style={{
          padding: "10px 14px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "linear-gradient(135deg, #7c6df0 0%, #6d52e8 100%)"
            : "rgba(255,255,255,0.06)",
          color: isUser ? "#fff" : "rgba(255,255,255,0.90)",
          fontSize: 13.5, lineHeight: 1.6,
          fontFamily: "'DM Sans', sans-serif",
          border: isUser ? "1px solid rgba(124,109,240,0.5)" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isUser ? "0 4px 16px rgba(124,109,240,0.25)" : "none",
          letterSpacing: "0.01em", whiteSpace: "pre-wrap", wordBreak: "break-word"
        }}>
          {message.text}
        </div>
        <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif", paddingLeft: isUser ? 0 : 4, paddingRight: isUser ? 4 : 0 }}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
};

const QuickReplies = ({ onSelect }) => {
  const suggestions = ["Help me choose a sofa", "Modern living room ideas", "Small space tips", "Color palette advice"];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "0 16px 12px" }}>
      {suggestions.map(s => (
        <button key={s} onClick={() => onSelect(s)} style={{
          padding: "6px 12px", borderRadius: 20,
          border: "1px solid rgba(124,109,240,0.35)",
          background: "rgba(124,109,240,0.1)",
          color: "rgba(180,160,255,0.9)", fontSize: 11.5,
          fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
          transition: "all 0.18s ease", letterSpacing: "0.02em"
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,109,240,0.22)"; e.currentTarget.style.borderColor = "rgba(124,109,240,0.6)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,109,240,0.1)"; e.currentTarget.style.borderColor = "rgba(124,109,240,0.35)"; }}
        >
          {s}
        </button>
      ))}
    </div>
  );
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([{
    id: 1,
    text: "Hello! I'm your DecoView design assistant. I can help you with furniture selection, room layouts, color palettes, and interior styling. What are you working on?",
    sender: "bot",
    timestamp: new Date(),
  }]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    setShowQuickReplies(false);
    const userMessage = { id: Date.now(), text, sender: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const newHistory = [...conversationHistory, { role: "user", content: text }];
    setConversationHistory(newHistory);

    try {
      const response = await fetch(
        "http://localhost:5000/api/chatbot/message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            conversationId: "user-123",
          }),
        },
      );

      const data = await response.json();
      const replyText = data.reply;
      // const replyText = data.content?.find(b => b.type === "text")?.text
      //   || "I'm sorry, I couldn't generate a response. Please try again.";
      const botMessage = { id: Date.now() + 1, text: replyText, sender: "bot", timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      setConversationHistory(prev => [...prev, { role: "assistant", content: replyText }]);
      if (!isOpen) setUnreadCount(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please check your connection and try again.",
        sender: "bot", timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => { e?.preventDefault(); sendMessage(inputValue); };
  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };
  const clearChat = () => {
    setMessages([{ id: Date.now(), text: "Chat cleared. How can I help you with your interior design today?", sender: "bot", timestamp: new Date() }]);
    setConversationHistory([]);
    setShowQuickReplies(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes chatFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes chatPulse { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes chatOpen { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes badgePop { from { transform: scale(0); } to { transform: scale(1); } }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        .dv-send-btn:hover:not(:disabled) { background: rgba(124,109,240,0.9) !important; transform: scale(1.05); }
        .dv-send-btn:active:not(:disabled) { transform: scale(0.95); }
        .dv-toggle-btn:hover { transform: scale(1.08) !important; box-shadow: 0 8px 32px rgba(124,109,240,0.5) !important; }
      `}</style>

      {/* Floating Toggle Button */}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999 }}>
        {unreadCount > 0 && !isOpen && (
          <div style={{
            position: "absolute", top: -6, right: -6,
            background: "#ef4444", color: "#fff",
            width: 20, height: 20, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            animation: "badgePop 0.2s ease-out", zIndex: 1
          }}>{unreadCount}</div>
        )}
        <button
          className="dv-toggle-btn"
          onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
          style={{
            width: 58, height: 58, borderRadius: "50%",
            background: "linear-gradient(135deg, #7c6df0 0%, #9d84f5 100%)",
            border: "none", cursor: "pointer", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 6px 24px rgba(124,109,240,0.45)",
            transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: "transform 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
            {isOpen
              ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              : <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />}
          </svg>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 100, right: 28,
          width: 380, zIndex: 9998,
          borderRadius: 20,
          background: "linear-gradient(160deg, #13111f 0%, #0e0d1a 100%)",
          border: "1px solid rgba(255,255,255,0.09)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,109,240,0.15)",
          display: "flex", flexDirection: "column",
          height: isMinimized ? "auto" : 520,
          animation: "chatOpen 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif"
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", gap: 12, flexShrink: 0
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, #7c6df0, #a78bfa)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 600, color: "#fff",
              boxShadow: "0 0 16px rgba(124,109,240,0.4)",
              flexShrink: 0, border: "1.5px solid rgba(167,139,250,0.5)"
            }}>D</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.95)", letterSpacing: "0.01em" }}>DecoView Assistant</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80" }} />
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}>Online · Design Expert</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                {
                  title: "Clear chat", onClick: clearChat,
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4" /></svg>,
                  hoverStyle: { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }
                },
                {
                  title: isMinimized ? "Expand" : "Minimize", onClick: () => setIsMinimized(!isMinimized),
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{isMinimized ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}</svg>,
                  hoverStyle: { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }
                },
                {
                  title: "Close", onClick: () => setIsOpen(false),
                  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
                  hoverStyle: { background: "rgba(239,68,68,0.15)", color: "#f87171" }
                }
              ].map(({ title, onClick, icon, hoverStyle }) => (
                <button key={title} onClick={onClick} title={title} style={{
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s ease"
                }}
                  onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                >{icon}</button>
              ))}
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="chat-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                {isLoading && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-end", animation: "chatFadeIn 0.25s ease-out" }}>
                    <ChatAvatar sender="bot" />
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {showQuickReplies && messages.length <= 1 && (
                <QuickReplies onSelect={(text) => sendMessage(text)} />
              )}

              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />

              {/* Input */}
              <div style={{ padding: "12px 14px", background: "rgba(255,255,255,0.02)", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about furniture, layouts, styles…"
                    rows={1}
                    disabled={isLoading}
                    style={{
                      flex: 1, border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 14, padding: "10px 14px",
                      background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.9)",
                      fontSize: 13.5, fontFamily: "'DM Sans', sans-serif",
                      outline: "none", resize: "none", lineHeight: 1.5, maxHeight: 100,
                      transition: "border-color 0.2s ease", letterSpacing: "0.01em",
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = "rgba(124,109,240,0.55)"; e.currentTarget.style.background = "rgba(124,109,240,0.08)"; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  />
                  <button
                    className="dv-send-btn"
                    onClick={handleSubmit}
                    disabled={isLoading || !inputValue.trim()}
                    style={{
                      width: 40, height: 40, borderRadius: 12, border: "none",
                      background: inputValue.trim() && !isLoading
                        ? "linear-gradient(135deg, #7c6df0 0%, #9d84f5 100%)"
                        : "rgba(255,255,255,0.07)",
                      color: inputValue.trim() && !isLoading ? "#fff" : "rgba(255,255,255,0.25)",
                      cursor: inputValue.trim() && !isLoading ? "pointer" : "default",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      boxShadow: inputValue.trim() && !isLoading ? "0 4px 16px rgba(124,109,240,0.35)" : "none"
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 8, letterSpacing: "0.03em" }}>
                  Enter to send · Shift+Enter for new line
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── HomePage Component ───────────────────────────────────────────────────────

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => { setIsLoading(false); setShowLogin(false); navigate("/design"); }, 1000);
      } else {
        setError(data.message || "Login failed");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Network error. Please check if backend is running.");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    if (!email || !password) { setError("Email and password are required"); setIsLoading(false); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); setIsLoading(false); return; }
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Account created successfully! Redirecting...");
        setTimeout(() => { setIsLoading(false); setShowLogin(false); navigate("/design"); }, 1000);
      } else {
        setError(data.message || "Signup failed");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Network error. Please check if backend is running.");
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    setError(""); setSuccess(""); setEmail(""); setPassword(""); setName("");
  };

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: "linear-gradient(160deg, #EEF4FF 0%, #D6E8FF 35%, #C2DAFF 65%, #B8D4FF 85%, #D6E8FF 100%)" }}
    >
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-slide-up">
            <button
              onClick={() => { setShowLogin(false); setError(""); setSuccess(""); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{isSignup ? "Create Account" : "Designer Login"}</h2>
              <p className="text-gray-600 mt-2">{isSignup ? "Join DecoView today" : "Welcome back to DecoView"}</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">{success}</div>}

            <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (Optional)</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    placeholder="Your name" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="designer@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="••••••••" required minLength={6} />
                {isSignup && <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>}
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{isSignup ? "Creating Account..." : "Signing In..."}</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                    </svg>
                    <span>{isSignup ? "Create Account" : "Sign In"}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={toggleAuthMode} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed w-full z-50" style={{
        background: "linear-gradient(135deg, #EEF4FF 0%, #D6E8FF 60%, #C2DAFF 100%)",
        borderBottom: "1px solid rgba(74,127,212,0.2)",
        backdropFilter: "blur(8px)",
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-2 text-xl font-bold" style={{ color: "#1E3A6E" }}>DecoView</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" style={{ color: "#2E5FA3" }} className="hover:text-indigo-800 transition-colors duration-300">Features</Link>
              <Link to="/how-it-works" style={{ color: "#2E5FA3" }} className="hover:text-indigo-800 transition-colors duration-300">How It Works</Link>
              <Link to="/gallery" style={{ color: "#2E5FA3" }} className="hover:text-indigo-800 transition-colors duration-300">Gallery</Link>
              <button onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
                Login
              </button>
            </div>

            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md hover:text-indigo-600" style={{ color: "#2E5FA3" }}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div style={{ background: "#D6E8FF", borderTop: "1px solid rgba(74,127,212,0.15)" }}>
            <div className="px-4 py-3 space-y-2">
              <Link to="/features" className="block hover:text-indigo-800" style={{ color: "#2E5FA3" }}>Features</Link>
              <Link to="/how-it-works" className="block hover:text-indigo-800" style={{ color: "#2E5FA3" }}>How It Works</Link>
              <Link to="/gallery" className="block hover:text-indigo-800" style={{ color: "#2E5FA3" }}>Gallery</Link>
              <button onClick={() => { setShowLogin(true); setIsMenuOpen(false); }}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                </svg>
                Designer Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="pt-20 relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #EEF4FF 0%, #D6E8FF 30%, #C2DAFF 60%, #B8D4FF 80%, #D6E8FF 100%)",
        fontFamily: "'Jost', sans-serif",
      }}>
        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(90deg,rgba(74,127,212,0.07) 0 1px,transparent 1px 68px),repeating-linear-gradient(0deg,rgba(74,127,212,0.07) 0 1px,transparent 1px 68px)",
        }} />
        {/* Decorative circles */}
        <div className="absolute rounded-full pointer-events-none" style={{ width: 480, height: 480, border: "1px solid rgba(74,127,212,0.22)", top: "50%", left: "42%", transform: "translate(-50%,-50%)" }} />
        <div className="absolute rounded-full pointer-events-none" style={{ width: 320, height: 320, border: "1px solid rgba(74,127,212,0.13)", top: "50%", left: "42%", transform: "translate(-50%,-50%)" }} />
        {/* Left accent bar */}
        <div className="absolute hidden lg:block" style={{ width: 3, height: 160, background: "linear-gradient(to bottom,transparent,#4A7FD4,transparent)", left: 48, top: "50%", transform: "translateY(-50%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left content */}
          <div className="text-center lg:text-left animate-slide-up">
            <div className="flex items-center gap-3 mb-5 justify-center lg:justify-start">
              <div style={{ width: 36, height: 1, background: "#4A7FD4" }} />
              <span style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#2E5FA3", fontWeight: 400 }}>
                Luxury Interior Design
              </span>
            </div>

            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(42px,5vw,60px)", fontWeight: 300, lineHeight: 1.08, color: "#1E3A6E" }}>
              Craft Your{" "}
              <em style={{ fontStyle: "italic", color: "#2E5FA3" }}>Dream Space</em>
              <br />With Us
            </h1>

            <p className="mt-5 max-w-md mx-auto lg:mx-0" style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.8, color: "#4A6FA5", letterSpacing: "0.01em" }}>
              Design and visualize furniture layouts with precision, bringing your perfect room to life in stunning 3D.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/design" style={{
                padding: "13px 34px", background: "#1E3A6E", color: "#EEF4FF",
                fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 400,
                textDecoration: "none", display: "inline-block",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(30, 58, 110, 0.1)",
              }}
                onMouseOver={e => { e.currentTarget.style.background = "#4A7FD4"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 16px rgba(30, 58, 110, 0.2)"; }}
                onMouseOut={e => { e.currentTarget.style.background = "#1E3A6E"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 6px rgba(30, 58, 110, 0.1)"; }}
              >
                Get Started
              </Link>
              <Link to="/how-it-works" style={{
                padding: "12px 28px", background: "transparent", color: "#1E3A6E",
                fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 400,
                border: "2px solid rgba(30,58,110,0.25)", textDecoration: "none", display: "inline-block",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", borderRadius: "8px",
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "#4A7FD4"; e.currentTarget.style.color = "#4A7FD4"; e.currentTarget.style.background = "rgba(74, 127, 212, 0.05)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 12px rgba(74, 127, 212, 0.15)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(30,58,110,0.25)"; e.currentTarget.style.color = "#1E3A6E"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                Learn More
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-12 flex gap-9 justify-center lg:justify-start" style={{ borderTop: "1px solid rgba(74,127,212,0.25)", paddingTop: 28 }}>
              {[["1,200+", "Projects Done"], ["98%", "Satisfaction"], ["15 yrs", "Experience"]].map(([num, lbl]) => (
                <div key={lbl}>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300, color: "#1E3A6E", display: "block" }}>{num}</span>
                  <span style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4A6FA5", display: "block", marginTop: 2 }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-lg">
              <img className="w-full object-cover transition-all duration-300 hover:scale-110" style={{ height: 420 }}
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                alt="Woman relaxing on sofa" />
              <div className="absolute inset-0 transition-opacity duration-300 opacity-0 hover:opacity-100"
                style={{ background: "linear-gradient(160deg,transparent 50%,rgba(30,58,110,0.3))" }} />
              <div className="absolute" style={{ top: -10, left: -10, width: 32, height: 32, borderTop: "2px solid #4A7FD4", borderLeft: "2px solid #4A7FD4" }} />
              <div className="absolute" style={{ bottom: -10, right: -10, width: 32, height: 32, borderBottom: "2px solid #4A7FD4", borderRight: "2px solid #4A7FD4" }} />
              <div className="absolute hidden sm:block" style={{ bottom: 28, left: -36, background: "#1E3A6E", color: "#EEF4FF", padding: "18px 22px", minWidth: 148 }}>
                <span style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7EB3FF", display: "block", marginBottom: 6 }}>Award Winning</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, display: "block" }}>Best Studio</span>
                <span style={{ fontSize: 10, color: "rgba(238,244,255,0.5)", display: "block", marginTop: 2 }}>Interior Design Awards 2024</span>
              </div>
              <div className="absolute hidden sm:flex items-center gap-2" style={{ top: 28, right: -16, background: "#EEF4FF", border: "1px solid rgba(74,127,212,0.35)", padding: "10px 16px" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#7CBF8E" }} />
                <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A6FA5" }}>Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Professional Chatbot (fixed bottom-right) ── */}
      <Chatbot />
    </div>
  );
}

export default HomePage;

// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { Link } from "react-router-dom";
// import LoginModal from "./components/LoginModel";
// import Chatbot from "./components/Chatbot";

// function HomePage() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const navigate = useNavigate();
//   const [showLogin, setShowLogin] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleLogin = (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     console.log(`email: ${email} and password: ${password}`);
//     navigate("/design");

//     setTimeout(() => {
//       setIsLoading(false);
//       setShowLogin(false);
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen bg-neutral-50 font-sans">
//       {showLogin && (
//         <LoginModal
//           setShowLogin={setShowLogin}
//           setEmail={setEmail}
//           setPassword={setPassword}
//           handleLogin={handleLogin}
//           isLoading={isLoading}
//           email={email}
//           password={password}
//         />
//       )}

//       {/* Navigation */}
//       <nav className="bg-white shadow-lg fixed w-full z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <div className="flex-shrink-0 flex items-center">
//                 <svg
//                   className="h-8 w-8 text-indigo-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <span className="ml-2 text-xl font-bold text-gray-900">
//                   DecoView
//                 </span>
//               </div>
//             </div>

//             <div className="hidden md:flex items-center space-x-8">
//               <a
//                 href="#features"
//                 className="text-gray-700 hover:text-indigo-600 transition-colors duration-300"
//               >
//                 Features
//               </a>
//               <a
//                 href="#how-it-works"
//                 className="text-gray-700 hover:text-indigo-600 transition-colors duration-300"
//               >
//                 How It Works
//               </a>
//               <a
//                 href="#gallery"
//                 className="text-gray-700 hover:text-indigo-600 transition-colors duration-300"
//               >
//                 Gallery
//               </a>
//               <button
//                 onClick={() => setShowLogin(true)}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300 flex items-center gap-2"
//               >
//                 <svg
//                   className="h-4 w-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M11 16l-4-4m0 0l4-4m-4 4h14"
//                   />
//                 </svg>
//                 Login
//               </button>
//             </div>

//             <div className="md:hidden flex items-center">
//               <button
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//                 className="p-2 rounded-md text-gray-700 hover:text-indigo-600"
//               >
//                 <svg
//                   className="h-6 w-6"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   {isMenuOpen ? (
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   ) : (
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 6h16M4 12h16M4 18h16"
//                     />
//                   )}
//                 </svg>
//               </button>
//             </div>
//           </div>
//         </div>

//         {isMenuOpen && (
//           <div className="md:hidden bg-white shadow-lg">
//             <div className="px-4 py-3 space-y-2">
//               <a
//                 href="#features"
//                 className="block text-gray-700 hover:text-indigo-600"
//               >
//                 Features
//               </a>
//               <a
//                 href="#how-it-works"
//                 className="block text-gray-700 hover:text-indigo-600"
//               >
//                 How It Works
//               </a>
//               <a
//                 href="#gallery"
//                 className="block text-gray-700 hover:text-indigo-600"
//               >
//                 Gallery
//               </a>
//               <button
//                 onClick={() => {
//                   setShowLogin(true);
//                   setIsMenuOpen(false);
//                 }}
//                 className="w-full px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 flex items-center justify-center gap-2"
//               >
//                 <svg
//                   className="h-4 w-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M11 16l-4-4m0 0l4-4m-4 4h14"
//                   />
//                 </svg>
//                 Designer Login
//               </button>
//             </div>
//           </div>
//         )}
//       </nav>
//       {/* Hero Section */}
//       <div
//         className="pt-20 relative overflow-hidden"
//         style={{ background: "#F8F4EF", fontFamily: "'Jost', sans-serif" }}
//       >
//         {/* Grid texture */}
//         <div
//           className="absolute inset-0 pointer-events-none"
//           style={{
//             backgroundImage:
//               "repeating-linear-gradient(90deg,rgba(200,169,126,0.08) 0 1px,transparent 1px 68px),repeating-linear-gradient(0deg,rgba(200,169,126,0.08) 0 1px,transparent 1px 68px)",
//           }}
//         />
//         {/* Decorative circles */}
//         <div
//           className="absolute rounded-full pointer-events-none"
//           style={{
//             width: 480,
//             height: 480,
//             border: "1px solid rgba(200,169,126,0.22)",
//             top: "50%",
//             left: "42%",
//             transform: "translate(-50%,-50%)",
//           }}
//         />
//         <div
//           className="absolute rounded-full pointer-events-none"
//           style={{
//             width: 320,
//             height: 320,
//             border: "1px solid rgba(200,169,126,0.13)",
//             top: "50%",
//             left: "42%",
//             transform: "translate(-50%,-50%)",
//           }}
//         />
//         {/* Left accent bar */}
//         <div
//           className="absolute hidden lg:block"
//           style={{
//             width: 3,
//             height: 160,
//             background:
//               "linear-gradient(to bottom,transparent,#C8A97E,transparent)",
//             left: 48,
//             top: "50%",
//             transform: "translateY(-50%)",
//           }}
//         />

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-12 items-center relative z-10">
//           {/* Left content */}
//           <div className="text-center lg:text-left animate-slide-up">
//             {/* Eyebrow */}
//             <div className="flex items-center gap-3 mb-5 justify-center lg:justify-start">
//               <div style={{ width: 36, height: 1, background: "#C8A97E" }} />
//               <span
//                 style={{
//                   fontSize: 11,
//                   letterSpacing: "0.22em",
//                   textTransform: "uppercase",
//                   color: "#B07A3A",
//                   fontWeight: 400,
//                 }}
//               >
//                 Luxury Interior Design
//               </span>
//             </div>

//             <h1
//               style={{
//                 fontFamily: "'Cormorant Garamond', serif",
//                 fontSize: "clamp(42px,5vw,60px)",
//                 fontWeight: 300,
//                 lineHeight: 1.08,
//                 color: "#1E1810",
//               }}
//             >
//               Craft Your{" "}
//               <em style={{ fontStyle: "italic", color: "#B07A3A" }}>
//                 Dream Space
//               </em>
//               <br />
//               With Us
//             </h1>

//             <p
//               className="mt-5 max-w-md mx-auto lg:mx-0"
//               style={{
//                 fontSize: 14,
//                 fontWeight: 300,
//                 lineHeight: 1.8,
//                 color: "#7D6B55",
//                 letterSpacing: "0.01em",
//               }}
//             >
//               Design and visualize furniture layouts with precision, bringing
//               your perfect room to life in stunning 3D.
//             </p>

//             <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
//               <Link
//                 to="/design"
//                 style={{
//                   padding: "13px 34px",
//                   background: "#1E1810",
//                   color: "#F8F4EF",
//                   fontSize: 12,
//                   letterSpacing: "0.14em",
//                   textTransform: "uppercase",
//                   fontWeight: 400,
//                   textDecoration: "none",
//                   display: "inline-block",
//                   transition: "background 0.3s",
//                 }}
//                 onMouseOver={(e) =>
//                   (e.currentTarget.style.background = "#C8A97E")
//                 }
//                 onMouseOut={(e) =>
//                   (e.currentTarget.style.background = "#1E1810")
//                 }
//               >
//                 Get Started
//               </Link>
//               <a
//                 href="#how-it-works"
//                 style={{
//                   padding: "12px 28px",
//                   background: "transparent",
//                   color: "#1E1810",
//                   fontSize: 12,
//                   letterSpacing: "0.14em",
//                   textTransform: "uppercase",
//                   fontWeight: 400,
//                   border: "1px solid rgba(30,24,16,0.25)",
//                   textDecoration: "none",
//                   display: "inline-block",
//                   transition: "border-color 0.3s",
//                 }}
//                 onMouseOver={(e) => {
//                   e.currentTarget.style.borderColor = "#B07A3A";
//                   e.currentTarget.style.color = "#B07A3A";
//                 }}
//                 onMouseOut={(e) => {
//                   e.currentTarget.style.borderColor = "rgba(30,24,16,0.25)";
//                   e.currentTarget.style.color = "#1E1810";
//                 }}
//               >
//                 Learn More
//               </a>
//             </div>

//             {/* Stats row */}
//             <div
//               className="mt-12 flex gap-9 justify-center lg:justify-start"
//               style={{
//                 borderTop: "1px solid rgba(200,169,126,0.25)",
//                 paddingTop: 28,
//               }}
//             >
//               {[
//                 ["1,200+", "Projects Done"],
//                 ["98%", "Satisfaction"],
//                 ["15 yrs", "Experience"],
//               ].map(([num, lbl]) => (
//                 <div key={lbl}>
//                   <span
//                     style={{
//                       fontFamily: "'Cormorant Garamond',serif",
//                       fontSize: 28,
//                       fontWeight: 300,
//                       color: "#1E1810",
//                       display: "block",
//                     }}
//                   >
//                     {num}
//                   </span>
//                   <span
//                     style={{
//                       fontSize: 10,
//                       letterSpacing: "0.16em",
//                       textTransform: "uppercase",
//                       color: "#7D6B55",
//                       display: "block",
//                       marginTop: 2,
//                     }}
//                   >
//                     {lbl}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right image */}
//           <div className="relative">
//             <div className="relative">
//               <img
//                 className="w-full object-cover"
//                 style={{ height: 420 }}
//                 src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
//                 alt="Modern living room"
//               />
//               {/* Diagonal overlay */}
//               <div
//                 className="absolute inset-0"
//                 style={{
//                   background:
//                     "linear-gradient(160deg,transparent 50%,rgba(30,24,16,0.35))",
//                 }}
//               />
//               {/* Corner ornaments */}
//               <div
//                 className="absolute"
//                 style={{
//                   top: -10,
//                   left: -10,
//                   width: 32,
//                   height: 32,
//                   borderTop: "2px solid #C8A97E",
//                   borderLeft: "2px solid #C8A97E",
//                 }}
//               />
//               <div
//                 className="absolute"
//                 style={{
//                   bottom: -10,
//                   right: -10,
//                   width: 32,
//                   height: 32,
//                   borderBottom: "2px solid #C8A97E",
//                   borderRight: "2px solid #C8A97E",
//                 }}
//               />
//               {/* Award badge */}
//               <div
//                 className="absolute hidden sm:block"
//                 style={{
//                   bottom: 28,
//                   left: -36,
//                   background: "#1E1810",
//                   color: "#F8F4EF",
//                   padding: "18px 22px",
//                   minWidth: 148,
//                 }}
//               >
//                 <span
//                   style={{
//                     fontSize: 9,
//                     letterSpacing: "0.2em",
//                     textTransform: "uppercase",
//                     color: "#C8A97E",
//                     display: "block",
//                     marginBottom: 6,
//                   }}
//                 >
//                   Award Winning
//                 </span>
//                 <span
//                   style={{
//                     fontFamily: "'Cormorant Garamond',serif",
//                     fontSize: 22,
//                     fontWeight: 300,
//                     display: "block",
//                   }}
//                 >
//                   Best Studio
//                 </span>
//                 <span
//                   style={{
//                     fontSize: 10,
//                     color: "rgba(248,244,239,0.5)",
//                     display: "block",
//                     marginTop: 2,
//                   }}
//                 >
//                   Interior Design Awards 2024
//                 </span>
//               </div>
//               {/* Live pill */}
//               <div
//                 className="absolute hidden sm:flex items-center gap-2"
//                 style={{
//                   top: 28,
//                   right: -16,
//                   background: "#F8F4EF",
//                   border: "1px solid rgba(200,169,126,0.35)",
//                   padding: "10px 16px",
//                 }}
//               >
//                 <div
//                   style={{
//                     width: 7,
//                     height: 7,
//                     borderRadius: "50%",
//                     background: "#7CBF8E",
//                   }}
//                 />
//                 <span
//                   style={{
//                     fontSize: 10,
//                     letterSpacing: "0.1em",
//                     textTransform: "uppercase",
//                     color: "#7D6B55",
//                   }}
//                 >
//                   Available Now
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Features Section */}
//       <div id="features" className="py-16 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h2 className="text-indigo-600 font-semibold tracking-wide uppercase">
//               Features
//             </h2>
//             <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
//               Design with Precision
//             </p>
//             <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//               Powerful tools to create flawless furniture designs for any space.
//             </p>
//           </div>

//           <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {[
//               {
//                 icon: "PanelLeft",
//                 title: "Room Customization",
//                 desc: "Define room dimensions, shapes, and colors for a realistic design canvas.",
//                 img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80",
//               },
//               {
//                 icon: "LampDesk",
//                 title: "3D Visualization",
//                 desc: "Instantly view your 2D designs in immersive 3D for a true-to-life experience.",
//                 img: "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
//               },
//               {
//                 icon: "Scaling",
//                 title: "Perfect Scaling",
//                 desc: "Scale furniture to fit any room perfectly, ensuring balanced layouts.",
//                 img: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80",
//               },
//               {
//                 icon: "ShoppingBag",
//                 title: "Furniture Customization",
//                 desc: "Personalize colors, textures, and finishes for every piece.",
//                 img: "https://images.unsplash.com/photo-1618220179428-22790b461013?ixlib=rb-4.0.3&auto=format&fit=crop&w=1527&q=80",
//               },
//               {
//                 icon: "Save",
//                 title: "Save & Edit Designs",
//                 desc: "Store your designs securely and edit them anytime with ease.",
//                 img: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
//               },
//               {
//                 icon: "Users",
//                 title: "Designer Accounts",
//                 desc: "Secure access for designers to manage and create stunning layouts.",
//                 img: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
//               },
//             ].map((feature, index) => (
//               <div
//                 key={index}
//                 className="relative bg-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up"
//               >
//                 <div className="absolute -top-4 left-6 bg-indigo-600 text-white rounded-full p-2">
//                   <svg
//                     className="h-6 w-6"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d={
//                         feature.icon === "PanelLeft"
//                           ? "M4 5h16M4 11h16M4 17h16"
//                           : feature.icon === "LampDesk"
//                             ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                             : feature.icon === "Scaling"
//                               ? "M3 3h18M3 21h18M3 12h18"
//                               : feature.icon === "ShoppingBag"
//                                 ? "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
//                                 : feature.icon === "Save"
//                                   ? "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
//                                   : "M12 4.5v15m7.5-7.5h-15"
//                       }
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="mt-8 text-lg font-semibold text-gray-900">
//                   {feature.title}
//                 </h3>
//                 <p className="mt-2 text-gray-600">{feature.desc}</p>
//                 <img
//                   src={feature.img}
//                   alt={feature.title}
//                   className="mt-4 rounded-lg shadow-sm w-full h-40 object-cover"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//       {/* How It Works Section */}
//       <div
//         id="how-it-works"
//         className="py-16 bg-gradient-to-br from-indigo-50 to-white"
//       >
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h2 className="text-indigo-600 font-semibold tracking-wide uppercase">
//               How It Works
//             </h2>
//             <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
//               Streamlined Design Process
//             </p>
//             <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//               Transform your ideas into reality in four simple steps.
//             </p>
//           </div>

//           <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
//             {[
//               {
//                 step: 1,
//                 title: "Enter Room Details",
//                 desc: "Input dimensions, shapes, and colors to create your virtual room.",
//                 img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80",
//               },
//               {
//                 step: 2,
//                 title: "Create 2D Design",
//                 desc: "Arrange furniture from our catalog in an intuitive 2D interface.",
//                 img: "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80",
//               },
//               {
//                 step: 3,
//                 title: "View in 3D",
//                 desc: "Switch to 3D to visualize your design in a realistic setting.",
//                 img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80",
//               },
//               {
//                 step: 4,
//                 title: "Customize & Refine",
//                 desc: "Fine-tune colors, textures, and scaling for a perfect fit.",
//                 img: "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
//               },
//             ].map((step, index) => (
//               <div
//                 key={index}
//                 className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up"
//               >
//                 <div className="absolute top-6 left-6 bg-indigo-600 text-white rounded-full h-10 w-10 flex items-center justify-center text-lg font-bold">
//                   {step.step}
//                 </div>
//                 <h3 className="ml-16 text-lg font-semibold text-gray-900">
//                   {step.title}
//                 </h3>
//                 <p className="ml-16 mt-2 text-gray-600">{step.desc}</p>
//                 <img
//                   src={step.img}
//                   alt={step.title}
//                   className="mt-4 rounded-lg shadow-sm w-full h-48 object-cover"
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//       {/* Gallery Section */}
//       <div id="gallery" className="py-16 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h2 className="text-indigo-600 font-semibold tracking-wide uppercase">
//               Gallery
//             </h2>
//             <p className="mt-2 text-3xl sm:text-4xl font-bold text-gray-900">
//               Inspiration Gallery
//             </p>
//             <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
//               Explore stunning designs to spark your creativity.
//             </p>
//           </div>

//           <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {[
//               {
//                 title: "Modern Living Room",
//                 desc: "Sleek and contemporary elegance for your living space.",
//                 img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1558&q=80",
//                 tags: ["Contemporary", "Neutral Tones"],
//               },
//               {
//                 title: "Spacious Dining Area",
//                 desc: "Ideal for family gatherings and entertaining.",
//                 img: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
//                 tags: ["Family Style", "Warm Tones"],
//               },
//               {
//                 title: "Home Office",
//                 desc: "Ergonomic and minimalist workspace for productivity.",
//                 img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80",
//                 tags: ["Minimalist", "Productivity"],
//               },
//             ].map((item, index) => (
//               <div
//                 key={index}
//                 className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up"
//               >
//                 <img
//                   className="w-full h-64 object-cover"
//                   src={item.img}
//                   alt={item.title}
//                 />
//                 <div className="p-6">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {item.title}
//                   </h3>
//                   <p className="mt-2 text-gray-600">{item.desc}</p>
//                   <div className="mt-4 flex gap-2">
//                     {item.tags.map((tag, i) => (
//                       <span
//                         key={i}
//                         className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-12 text-center">
//             <a
//               href="#"
//               className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors duration-300"
//             >
//               View All Designs
//             </a>
//           </div>
//         </div>
//       </div>
//       {/* CTA Section */}
//       <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 py-16">
//         <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl sm:text-4xl font-bold text-white">
//             Ready to Design Your Future?
//           </h2>
//           <p className="mt-4 text-lg text-indigo-100">
//             Create breathtaking furniture layouts that bring visions to life.
//           </p>
//           <a
//             href="#"
//             className="mt-8 inline-flex items-center px-6 py-3 bg-white text-indigo-700 rounded-full hover:bg-indigo-50 transition-colors duration-300"
//           >
//             <svg
//               className="h-5 w-5 mr-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M11 16l-4-4m0 0l4-4m-4 4h14"
//               />
//             </svg>
//             Sign In as Designer
//           </a>
//         </div>
//       </div>
//       {/* Footer */}
//       <footer className="bg-gray-900 py-12">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div className="flex items-center">
//               <svg
//                 className="h-8 w-8 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//               <span className="ml-2 text-xl font-bold text-white">
//                 DecoView
//               </span>
//             </div>
//             <p className="mt-4 md:mt-0 text-gray-400 text-sm">
//               © 2025 Furnish Studio. All rights reserved.
//             </p>
//           </div>
//           <div className="mt-8 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
//             <div className="flex gap-6">
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <svg
//                   className="h-6 w-6"
//                   fill="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <svg
//                   className="h-6 w-6"
//                   fill="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     fillRule="evenodd"
//                     d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153SEND 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
//                     clipRule="evenodd"
//                   />
//                 </svg>
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white">
//                 <svg
//                   className="h-6 w-6"
//                   fill="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//                 </svg>
//               </a>
//             </div>
//             <nav className="mt-4 md:mt-0 flex gap-6">
//               <a href="#" className="text-gray-400 hover:text-white text-sm">
//                 Privacy
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white text-sm">
//                 Terms
//               </a>
//               <a href="#" className="text-gray-400 hover:text-white text-sm">
//                 Contact
//               </a>
//             </nav>
//           </div>
//         </div>
//       </footer>
//       <Chatbot />
//     </div>
//   );
// }

// export default HomePage;
