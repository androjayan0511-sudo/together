import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Navbar } from './components/navigation/Navbar.jsx';
import { AuthPage } from './pages/auth/AuthPage.jsx';
import { HomePage } from './pages/home/HomePage.jsx';
import { ChatPage } from './pages/chat/ChatPage.jsx';
import { MemoriesPage } from './pages/memories/MemoriesPage.jsx';
import { TogetherPage } from './pages/together/TogetherPage.jsx';
import { SettingsPage } from './pages/settings/SettingsPage.jsx';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-canvas)',
        gap: '16px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent)',
          animation: 'tmPulse 1.5s infinite ease-in-out'
        }} />
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.02em'
        }}>
          TogetherMiles
        </span>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'home' && <HomePage setActiveTab={setActiveTab} />}
        {activeTab === 'chat' && <ChatPage />}
        {activeTab === 'memories' && <MemoriesPage />}
        {activeTab === 'together' && <TogetherPage setActiveTab={setActiveTab} />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
