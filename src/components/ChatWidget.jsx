import { useState, useEffect, useRef } from "react";
import "./ChatWidget.css";

const QUICK_REPLIES = [
  "Track my order",
  "Product question",
  "Returns & refunds",
  "Speak to agent",
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "agent",
    text: "Hi there! 👋 Welcome to Noor Layers. How can we help you today?",
    time: new Date(),
  },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEnd = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: "user",
      text: text.trim(),
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate agent response (replace with actual API)
    setTimeout(() => {
      setTyping(false);
      const responses = {
        "track my order": "I can help you track your order! Please share your order number.",
        "product question": "Of course! Which product would you like to know more about?",
        "returns & refunds": "Our return policy allows 7-day returns. Would you like to start a return?",
        "speak to agent": "Connecting you to an agent now... ⏳ One of our team members will be with you shortly!",
      };

      const lowerText = text.toLowerCase();
      let reply = "Thanks for your message! Our team will get back to you shortly. For urgent matters, please call us at +234 903 123 4567.";

      Object.keys(responses).forEach((key) => {
        if (lowerText.includes(key)) {
          reply = responses[key];
        }
      });

      const agentMsg = {
        id: Date.now() + 1,
        sender: "agent",
        text: reply,
        time: new Date(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      
      if (!open) setUnread((u) => u + 1);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        className={`nl-chat-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            {unread > 0 && <span className="nl-chat-badge">{unread}</span>}
          </>
        )}
      </button>

      {/* Chat Window */}
      <div className={`nl-chat-window ${open ? "open" : ""}`}>
        {/* Header */}
        <div className="nl-chat-header">
          <div className="nl-chat-header__avatar">
            <span>NL</span>
            <span className="nl-chat-status" />
          </div>
          <div className="nl-chat-header__info">
            <div className="nl-chat-header__title">Noor Layers Support</div>
            <div className="nl-chat-header__sub">
              <span className="nl-chat-dot" /> Online · Typically replies in minutes
            </div>
          </div>
          <button
            className="nl-chat-close"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="nl-chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`nl-chat-msg nl-chat-msg--${msg.sender}`}
            >
              {msg.sender === "agent" && (
                <div className="nl-chat-msg__avatar">NL</div>
              )}
              <div className="nl-chat-msg__bubble">
                <p>{msg.text}</p>
                <span className="nl-chat-msg__time">{formatTime(msg.time)}</span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="nl-chat-msg nl-chat-msg--agent">
              <div className="nl-chat-msg__avatar">NL</div>
              <div className="nl-chat-msg__bubble nl-chat-typing">
                <span /><span /><span />
              </div>
            </div>
          )}

          <div ref={messagesEnd} />
        </div>

        {/* Quick Replies */}
        {messages.length === 1 && !typing && (
          <div className="nl-chat-quick">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                className="nl-chat-quick__btn"
                onClick={() => sendMessage(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form className="nl-chat-input" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit" disabled={!input.trim()} aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}