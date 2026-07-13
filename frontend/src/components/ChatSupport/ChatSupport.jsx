import React, { useState, useRef, useEffect } from "react";
import "./chat-support.css";

const ChatSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "👋 Namaste! Welcome to Tour Management. How can I help you?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  // Bot responses
  const botResponses = {
    hi: "👋 Hello! How can I help you today?",
    hello: "👋 Hi there! Welcome! What can I help you with?",
    help: "📚 I can help with:\n• Tour bookings\n• Prices\n• Login/Register\n• Payments\n• Cancellation\n• Contact info",
    booking: "📅 To book a tour:\n1. Login\n2. Select tour\n3. Choose date\n4. Pay securely",
    price: "💰 Prices vary by destination and season. Check tour details for pricing.",
    login: "🔐 Click Login → Enter email & password → Sign in",
    register: "📝 Click Register → Fill details → Verify email → Start booking!",
    payment: "💳 We accept Card, UPI, Razorpay & Wallets. 🔒 Secure!",
    cancel: "❌ Cancel up to 7 days before for full refund",
    contact: "📞 Email: support@tourmanagement.com | Phone: +91-XXXXXXXXXX",
    thanks: "😊 Thank you for choosing us!",
    thank: "😊 Thank you for choosing us!",
    bye: "👋 Goodbye! Have a great day!",
  };

  const getResponse = (message) => {
    const msg = message.toLowerCase().trim();
    for (let key in botResponses) {
      if (msg.includes(key)) {
        return botResponses[key];
      }
    }
    return "🤖 I'm not sure. Try asking about booking, prices, login, or type 'help'";
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    // Add user message
    const userMsg = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages([...messages, userMsg]);

    // Get bot response
    setTimeout(() => {
      const botMsg = {
        id: messages.length + 2,
        text: getResponse(inputValue),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 500);

    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-support">
      {/* Chat Button */}
      <button
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat Support"
      >
        <i className={isOpen ? "ri-close-line" : "ri-chat-3-line"}></i>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <h4>💬 Chat Support</h4>
            <span className="status">🟢 Online</span>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="bubble">
                  <p>{msg.text}</p>
                  <span className="time">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSendMessage} className="send-btn">
              <i className="ri-send-plane-line"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSupport;
