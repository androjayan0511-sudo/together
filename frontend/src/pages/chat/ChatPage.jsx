import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { socket } from '../../services/socket.js';
import { Send, Check, CheckCheck } from 'lucide-react';

function formatDateDivider(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMessageTime(dateString) {
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function ChatPage() {
  const { user, partner, couple } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (!couple) return;

    // Load initial messages
    api.getMessages({ limit: 100 })
      .then(res => {
        setMessages(res.data || []);
        setTimeout(() => scrollToBottom('auto'), 100);
        // Mark partner messages as read
        api.markMessagesRead().catch(() => {});
      })
      .catch(err => console.error('[Chat load error]', err));

    // Listen to real-time incoming messages
    const unsubNewMessage = socket.on('NEW_MESSAGE', (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom('smooth');
      // If active, mark as read
      api.markMessagesRead().catch(() => {});
    });

    // Listen to read receipts from partner
    const unsubRead = socket.on('MESSAGES_READ', (readData) => {
      setMessages(prev => prev.map(m => {
        if (m.sender_id === user.id && !m.read_at) {
          return { ...m, read_at: readData.readAt };
        }
        return m;
      }));
    });

    // Listen to typing indicators
    const unsubTypingStart = socket.on('TYPING_START', (data) => {
      if (data.userId === partner?.id) {
        setPartnerTyping(true);
      }
    });

    const unsubTypingStop = socket.on('TYPING_STOP', (data) => {
      if (data.userId === partner?.id) {
        setPartnerTyping(false);
      }
    });

    return () => {
      unsubNewMessage();
      unsubRead();
      unsubTypingStart();
      unsubTypingStop();
    };
  }, [couple, user, partner]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Broadcast typing start
    socket.send('TYPING_START');

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.send('TYPING_STOP');
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    socket.send('TYPING_STOP');
    setIsSending(true);

    try {
      const res = await api.sendMessage({ content });
      setMessages(prev => [...prev, res.data]);
      scrollToBottom('smooth');
    } catch (err) {
      console.error('[Send message error]', err);
      setInputText(content); // restore on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const groupedMessages = [];
  let currentDate = '';
  messages.forEach(msg => {
    const msgDate = new Date(msg.created_at).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ isDivider: true, date: msg.created_at });
    }
    groupedMessages.push({ isDivider: false, ...msg });
  });

  return (
    <div className="chat-layout">
      {/* Conversation Header */}
      <header className="chat-header">
        <div className="chat-partner-info">
          <div className="chat-avatar">
            {partner?.avatar_url ? (
              <img src={partner.avatar_url} alt={partner.name} />
            ) : (
              partner?.name?.charAt(0) || 'P'
            )}
          </div>
          <div>
            <h2 className="chat-partner-name">{partner?.name}</h2>
            <span className="chat-status-text">
              {partnerTyping ? 'typing a message...' : 'Private conversation'}
            </span>
          </div>
        </div>
      </header>

      {/* Message List */}
      <div className="chat-messages-container">
        {messages.length === 0 ? (
          <div className="chat-empty-quiet">
            <p>Your quiet space with {partner?.name}.</p>
            <span>Send a message to say hello today.</span>
          </div>
        ) : (
          groupedMessages.map((item, index) => {
            if (item.isDivider) {
              return (
                <div key={`div-${index}`} className="date-divider">
                  <span>{formatDateDivider(item.date)}</span>
                </div>
              );
            }

            const isMine = item.sender_id === user?.id;

            return (
              <div
                key={item.id || index}
                className={`message-row ${isMine ? 'mine' : 'partner'}`}
              >
                <div className={`message-bubble ${isMine ? 'bubble-mine' : 'bubble-partner'}`}>
                  <p className="message-content">{item.content}</p>
                  <div className="message-meta">
                    <span className="message-time">{formatMessageTime(item.created_at)}</span>
                    {isMine && (
                      <span className="message-status">
                        {item.read_at ? (
                          <CheckCheck size={14} color="var(--accent)" />
                        ) : (
                          <Check size={14} color="var(--text-muted)" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Composer */}
      <div className="chat-composer-sticky">
        <form onSubmit={handleSendMessage} className="chat-composer-form">
          <textarea
            className="chat-input"
            placeholder={`Message ${partner?.name || ''}...`}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputText.trim() || isSending}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <style>{`
        .chat-layout {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px);
          max-width: 720px;
          margin: 0 auto;
          width: 100%;
          background-color: var(--bg-canvas);
        }

        @media (min-width: 768px) {
          .chat-layout {
            height: 100vh;
            border-left: 1px solid var(--border);
            border-right: 1px solid var(--border);
          }
        }

        .chat-header {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .chat-partner-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-avatar {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          background-color: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.95rem;
          overflow: hidden;
        }

        .chat-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .chat-partner-name {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .chat-status-text {
          font-size: 0.76rem;
          color: var(--text-muted);
          display: block;
        }

        .chat-messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .chat-empty-quiet {
          margin: auto;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.92rem;
        }

        .chat-empty-quiet span {
          display: block;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .date-divider {
          text-align: center;
          margin: 16px 0;
        }

        .date-divider span {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          background-color: var(--bg-tertiary);
          padding: 3px 12px;
          border-radius: var(--radius-full);
        }

        .message-row {
          display: flex;
          width: 100%;
        }

        .message-row.mine {
          justify-content: flex-end;
        }

        .message-row.partner {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 78%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          word-break: break-word;
          position: relative;
        }

        .bubble-mine {
          background-color: var(--text-primary);
          color: #FFFFFF;
          border-bottom-right-radius: 4px;
        }

        .bubble-partner {
          background-color: var(--bg-card);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-bottom-left-radius: 4px;
        }

        .message-content {
          font-size: 0.94rem;
          line-height: 1.45;
          color: inherit;
        }

        .message-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          margin-top: 4px;
        }

        .message-time {
          font-size: 0.7rem;
          opacity: 0.7;
        }

        .bubble-mine .message-time {
          color: rgba(255, 255, 255, 0.75);
        }

        .bubble-partner .message-time {
          color: var(--text-muted);
        }

        .message-status {
          display: flex;
          align-items: center;
        }

        .chat-composer-sticky {
          padding: 12px 16px 16px;
          background-color: var(--bg-canvas);
          border-top: 1px solid var(--border);
        }

        .chat-composer-form {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 6px 10px 6px 14px;
          transition: border-color var(--transition-fast);
        }

        .chat-composer-form:focus-within {
          border-color: var(--border-focus);
          box-shadow: 0 0 0 1px var(--border-focus);
        }

        .chat-input {
          flex: 1;
          border: none;
          background: transparent;
          resize: none;
          font-size: 0.94rem;
          line-height: 1.4;
          max-height: 120px;
          padding: 6px 0;
          color: var(--text-primary);
        }

        .chat-send-btn {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background-color: var(--accent);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color var(--transition-fast);
          flex-shrink: 0;
        }

        .chat-send-btn:hover:not(:disabled) {
          background-color: var(--accent-hover);
        }

        .chat-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
