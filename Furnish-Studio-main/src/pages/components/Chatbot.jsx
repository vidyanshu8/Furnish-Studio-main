import { useState, useRef, useEffect } from "react";

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
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "12px 16px",
      background: "rgba(255,255,255,0.05)",
      borderRadius: "18px 18px 18px 4px",
      width: "fit-content",
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "rgba(180,160,255,0.7)",
          animation: "pulse 1.4s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
          display: "block",
        }}
      />
    ))}
  </div>
);

const Avatar = ({ sender }) => (
  <div
    style={{
      width: 30,
      height: 30,
      borderRadius: "50%",
      flexShrink: 0,
      background:
        sender === "bot"
          ? "linear-gradient(135deg, #7c6df0 0%, #a78bfa 100%)"
          : "linear-gradient(135deg, #374151 0%, #4b5563 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 600,
      color: "#fff",
      border:
        sender === "bot"
          ? "1px solid rgba(167,139,250,0.4)"
          : "1px solid rgba(255,255,255,0.1)",
      boxShadow: sender === "bot" ? "0 0 12px rgba(124,109,240,0.3)" : "none",
    }}
  >
    {sender === "bot" ? "D" : "U"}
  </div>
);

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-end",
        flexDirection: isUser ? "row-reverse" : "row",
        animation: "fadeSlideIn 0.25s ease-out",
      }}
    >
      <Avatar sender={message.sender} />
      <div
        style={{
          maxWidth: "72%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
          gap: 4,
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            background: isUser
              ? "linear-gradient(135deg, #7c6df0 0%, #6d52e8 100%)"
              : "rgba(255,255,255,0.06)",
            color: isUser ? "#fff" : "rgba(255,255,255,0.90)",
            fontSize: 13.5,
            lineHeight: 1.6,
            fontFamily: "'DM Sans', sans-serif",
            border: isUser
              ? "1px solid rgba(124,109,240,0.5)"
              : "1px solid rgba(255,255,255,0.08)",
            boxShadow: isUser ? "0 4px 16px rgba(124,109,240,0.25)" : "none",
            letterSpacing: "0.01em",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message.text}
        </div>
        <span
          style={{
            fontSize: 10.5,
            color: "rgba(255,255,255,0.3)",
            fontFamily: "'DM Sans', sans-serif",
            paddingLeft: isUser ? 0 : 4,
            paddingRight: isUser ? 4 : 0,
          }}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

const QuickReplies = ({ onSelect }) => {
  const suggestions = [
    "Help me choose a sofa",
    "Modern living room ideas",
    "Small space tips",
    "Color palette advice",
  ];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: "0 16px 12px",
      }}
    >
      {suggestions.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          style={{
            padding: "6px 12px",
            borderRadius: 20,
            border: "1px solid rgba(124,109,240,0.35)",
            background: "rgba(124,109,240,0.1)",
            color: "rgba(180,160,255,0.9)",
            fontSize: 11.5,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.18s ease",
            letterSpacing: "0.02em",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124,109,240,0.22)";
            e.currentTarget.style.borderColor = "rgba(124,109,240,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(124,109,240,0.1)";
            e.currentTarget.style.borderColor = "rgba(124,109,240,0.35)";
          }}
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
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your DecoView design assistant. I can help you with furniture selection, room layouts, color palettes, and interior styling. What are you working on?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
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
    const userMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const newHistory = [
      ...conversationHistory,
      { role: "user", content: text },
    ];
    setConversationHistory(newHistory);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
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
      //   const replyText =
      //     data.content?.find((b) => b.type === "text")?.text ||
      //     "I'm sorry, I couldn't generate a response. Please try again.";

      const botMessage = {
        id: Date.now() + 1,
        text: replyText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);

      if (!isOpen) setUnreadCount((prev) => prev + 1);
    } catch {
      const errMsg = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please check your connection and try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        text: "Chat cleared. How can I help you with your interior design today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    setConversationHistory([]);
    setShowQuickReplies(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes chatOpen { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes badgePop { from { transform: scale(0); } to { transform: scale(1); } }
        .chat-scrollbar::-webkit-scrollbar { width: 4px; }
        .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .send-btn:hover { background: rgba(124,109,240,0.9) !important; transform: scale(1.05); }
        .send-btn:active { transform: scale(0.95); }
        .toggle-btn:hover { transform: scale(1.08) !important; box-shadow: 0 8px 32px rgba(124,109,240,0.5) !important; }
      `}</style>

      {/* Floating Toggle Button */}
      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 9999 }}>
        {unreadCount > 0 && !isOpen && (
          <div
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#ef4444",
              color: "#fff",
              width: 20,
              height: 20,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              animation: "badgePop 0.2s ease-out",
              zIndex: 1,
            }}
          >
            {unreadCount}
          </div>
        )}
        <button
          className="toggle-btn"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsMinimized(false);
          }}
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #7c6df0 0%, #9d84f5 100%)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 24px rgba(124,109,240,0.45)",
            transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: "transform 0.3s ease",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            {isOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 28,
            width: 380,
            zIndex: 9998,
            borderRadius: 20,
            background: "linear-gradient(160deg, #13111f 0%, #0e0d1a 100%)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,109,240,0.15)",
            display: "flex",
            flexDirection: "column",
            height: isMinimized ? "auto" : 520,
            animation: "chatOpen 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
            overflow: "hidden",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c6df0, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                boxShadow: "0 0 16px rgba(124,109,240,0.4)",
                flexShrink: 0,
                border: "1.5px solid rgba(167,139,250,0.5)",
              }}
            >
              D
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.95)",
                  letterSpacing: "0.01em",
                }}
              >
                DecoView Assistant
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                    boxShadow: "0 0 6px #4ade80",
                  }}
                />
                <span
                  style={{
                    fontSize: 11.5,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Online · Design Expert
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4" />
                </svg>
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? "Expand" : "Minimize"}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isMinimized ? (
                    <>
                      <polyline points="18 15 12 9 6 15" />
                    </>
                  ) : (
                    <>
                      <polyline points="6 9 12 15 18 9" />
                    </>
                  )}
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                  e.currentTarget.style.color = "#f87171";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          {!isMinimized && (
            <>
              <div
                className="chat-scrollbar"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 16px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                }}
              >
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-end",
                      animation: "fadeSlideIn 0.25s ease-out",
                    }}
                  >
                    <Avatar sender="bot" />
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {showQuickReplies && messages.length <= 1 && (
                <QuickReplies onSelect={(text) => sendMessage(text)} />
              )}

              {/* Divider */}
              <div
                style={{
                  height: "1px",
                  background: "rgba(255,255,255,0.06)",
                  flexShrink: 0,
                }}
              />

              {/* Input Area */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.02)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
                >
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about furniture, layouts, styles…"
                    rows={1}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 14,
                      padding: "10px 14px",
                      background: "rgba(255,255,255,0.06)",
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 13.5,
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                      resize: "none",
                      lineHeight: 1.5,
                      maxHeight: 100,
                      transition: "border-color 0.2s ease",
                      letterSpacing: "0.01em",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(124,109,240,0.55)";
                      e.currentTarget.style.background =
                        "rgba(124,109,240,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.1)";
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                    }}
                  />
                  <button
                    className="send-btn"
                    onClick={handleSubmit}
                    disabled={isLoading || !inputValue.trim()}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      border: "none",
                      background:
                        inputValue.trim() && !isLoading
                          ? "linear-gradient(135deg, #7c6df0 0%, #9d84f5 100%)"
                          : "rgba(255,255,255,0.07)",
                      color:
                        inputValue.trim() && !isLoading
                          ? "#fff"
                          : "rgba(255,255,255,0.25)",
                      cursor:
                        inputValue.trim() && !isLoading ? "pointer" : "default",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      boxShadow:
                        inputValue.trim() && !isLoading
                          ? "0 4px 16px rgba(124,109,240,0.35)"
                          : "none",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: "rgba(255,255,255,0.2)",
                    textAlign: "center",
                    marginTop: 8,
                    letterSpacing: "0.03em",
                  }}
                >
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

export default Chatbot;
