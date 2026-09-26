import React, { useState, useEffect } from 'react';
import { Home, MessageCircle, Image, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { socket } from '../../services/socket.js';

export function Navbar({ activeTab, setActiveTab }) {
  const { user, partner, isConnected } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Fetch initial unread count
    api.getUnreadCount()
      .then(res => setUnreadCount(res.data?.count || 0))
      .catch(() => {});

    // Listen to real-time events
    const unsubMessage = socket.on('NEW_MESSAGE', () => {
      if (activeTab !== 'chat') {
        setUnreadCount(c => c + 1);
      }
    });

    const unsubRead = socket.on('MESSAGES_READ', () => {
      // partner read messages
    });

    return () => {
      unsubMessage();
      unsubRead();
    };
  }, [user, activeTab]);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageCircle, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'memories', label: 'Memories', icon: Image },
    { id: 'together', label: 'Together', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'chat') {
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="tm-desktop-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <span className="brand-dot"></span>
            TogetherMiles
          </div>
          <span className="brand-subtitle">Private space for two</span>
        </div>

        {partner && (
          <div className="partner-status-pill">
            <div className="status-avatar">
              {partner.avatar_url ? (
                <img src={partner.avatar_url} alt={partner.name} />
              ) : (
                partner.name.charAt(0)
              )}
            </div>
            <div className="status-info">
              <span className="status-name">{partner.name}</span>
              <span className="status-indicator">
                <span className={`status-point ${isConnected ? 'online' : ''}`}></span>
                {isConnected ? 'Connected' : 'Invited'}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
              >
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.75} />
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-avatar-sm">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="user-text">
              <span className="user-name-line">{user?.name}</span>
              <span className="user-email-line">{user?.email}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="tm-mobile-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
              aria-label={item.label}
            >
              <div className="mobile-icon-wrapper">
                <Icon size={21} strokeWidth={isActive ? 2.2 : 1.75} />
                {item.badge && (
                  <span className="mobile-nav-badge">{item.badge}</span>
                )}
              </div>
              <span className="mobile-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        /* Desktop Sidebar Styles */
        .tm-desktop-sidebar {
          display: none;
        }

        @media (min-width: 768px) {
          .tm-desktop-sidebar {
            display: flex;
            flex-direction: column;
            width: 260px;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            background-color: var(--bg-card);
            border-right: 1px solid var(--border);
            padding: 32px 20px 24px;
            z-index: 50;
          }
        }

        .sidebar-brand {
          margin-bottom: 24px;
          padding-left: 10px;
        }

        .brand-mark {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--font-serif);
          font-size: 1.35rem;
          font-weight: 600;
          color: var(--text-primary);
          letter-spacing: -0.01em;
        }

        .brand-dot {
          width: 7px;
          height: 7px;
          border-radius: var(--radius-full);
          background-color: var(--accent);
          display: inline-block;
        }

        .brand-subtitle {
          display: block;
          font-size: 0.76rem;
          color: var(--text-muted);
          margin-top: 2px;
          font-family: var(--font-sans);
          letter-spacing: 0.02em;
        }

        .partner-status-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background-color: var(--bg-subtle);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          margin-bottom: 24px;
        }

        .status-avatar {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-full);
          background-color: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.88rem;
          overflow: hidden;
        }

        .status-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .status-info {
          display: flex;
          flex-direction: column;
        }

        .status-name {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .status-indicator {
          font-size: 0.74rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .status-point {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background-color: var(--text-muted);
        }

        .status-point.online {
          background-color: var(--success);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .sidebar-nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
          text-align: left;
          width: 100%;
          position: relative;
        }

        .sidebar-nav-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .sidebar-nav-btn.active {
          background-color: var(--accent-light);
          color: var(--accent);
          font-weight: 600;
        }

        .nav-label {
          flex: 1;
        }

        .nav-badge {
          background-color: var(--accent);
          color: var(--text-inverse);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          min-width: 18px;
          text-align: center;
        }

        .sidebar-footer {
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }

        .user-mini-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px;
        }

        .user-avatar-sm {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.85rem;
          overflow: hidden;
        }

        .user-avatar-sm img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-text {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .user-name-line {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email-line {
          font-size: 0.74rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Mobile Bottom Nav Styles */
        .tm-mobile-nav {
          display: flex;
          align-items: center;
          justify-content: space-around;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border);
          z-index: 100;
          padding: 0 8px;
        }

        @media (min-width: 768px) {
          .tm-mobile-nav {
            display: none;
          }
        }

        .mobile-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          flex: 1;
          height: 100%;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .mobile-nav-btn.active {
          color: var(--accent);
        }

        .mobile-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-nav-badge {
          position: absolute;
          top: -4px;
          right: -8px;
          background-color: var(--accent);
          color: var(--text-inverse);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: var(--radius-full);
          min-width: 15px;
          text-align: center;
        }

        .mobile-nav-label {
          font-size: 0.7rem;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
