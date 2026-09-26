import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { Copy, Check, Shield, User, Heart, Lock, LogOut, Trash2 } from 'lucide-react';

export function SettingsPage() {
  const { user, couple, partner, isConnected, logout, refreshUser, leaveCouple } = useAuth();
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'couple' | 'privacy' | 'account'

  // Profile Form
  const [profileName, setProfileName] = useState(user?.name || '');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [profileMsg, setProfileMsg] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Couple start date form
  const [startDate, setStartDate] = useState(couple?.relationship_start_date || '');
  const [coupleMsg, setCoupleMsg] = useState('');

  // Copy code
  const [copied, setCopied] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    try {
      await api.updateProfile({ name: profileName, timezone });
      await refreshUser();
      setProfileMsg('Profile saved successfully.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStartDate = async (e) => {
    e.preventDefault();
    setCoupleMsg('');
    try {
      await api.updateCoupleDate({ relationshipStartDate: startDate || null });
      await refreshUser();
      setCoupleMsg('Relationship date updated.');
      setTimeout(() => setCoupleMsg(''), 3000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordMsg(''), 3000);
    } catch (err) {
      setPasswordErr(err.message);
    }
  };

  const handleCopyCode = () => {
    if (!couple?.pairing_code) return;
    navigator.clipboard.writeText(couple.pairing_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveCouple = async () => {
    if (!window.confirm('Are you sure you want to disconnect from this couple space? Both partners will lose immediate access to shared messages and memories.')) {
      return;
    }
    try {
      await leaveCouple();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="settings-header">
        <h1 className="settings-page-title">Settings</h1>
        <p className="settings-page-sub">Manage your personal profile, couple space connection, and privacy.</p>
      </div>

      <div className="settings-nav-row">
        <button
          type="button"
          className={`settings-pill ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <User size={15} />
          Profile
        </button>
        <button
          type="button"
          className={`settings-pill ${activeSection === 'couple' ? 'active' : ''}`}
          onClick={() => setActiveSection('couple')}
        >
          <Heart size={15} />
          Couple Space
        </button>
        <button
          type="button"
          className={`settings-pill ${activeSection === 'privacy' ? 'active' : ''}`}
          onClick={() => setActiveSection('privacy')}
        >
          <Shield size={15} />
          Privacy & Security
        </button>
        <button
          type="button"
          className={`settings-pill ${activeSection === 'account' ? 'active' : ''}`}
          onClick={() => setActiveSection('account')}
        >
          <Lock size={15} />
          Account
        </button>
      </div>

      {/* SECTION 1: PROFILE */}
      {activeSection === 'profile' && (
        <div className="tm-card settings-card">
          <h2 className="settings-card-title">Your Profile</h2>
          <p className="settings-card-desc">Information visible to your partner inside TogetherMiles.</p>

          {profileMsg && <div className="settings-success-alert">{profileMsg}</div>}

          <form onSubmit={handleUpdateProfile}>
            <div className="tm-form-group">
              <label className="tm-label">Display Name</label>
              <input
                type="text"
                className="tm-input"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                required
              />
            </div>

            <div className="tm-form-group">
              <label className="tm-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="tm-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--bg-subtle)', opacity: 0.8 }}
              />
            </div>

            <div className="tm-form-group">
              <label className="tm-label">Timezone</label>
              <select
                className="tm-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="UTC">UTC (Universal)</option>
                <option value="America/New_York">Eastern Time (US/Canada)</option>
                <option value="America/Chicago">Central Time (US/Canada)</option>
                <option value="America/Denver">Mountain Time (US/Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US/Canada)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Europe/Paris">Paris / Berlin (CET)</option>
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>

            <button type="submit" className="tm-btn tm-btn-primary tm-btn-sm" style={{ marginTop: '10px' }}>
              Save Profile Changes
            </button>
          </form>
        </div>
      )}

      {/* SECTION 2: COUPLE SPACE */}
      {activeSection === 'couple' && (
        <div className="tm-card settings-card">
          <h2 className="settings-card-title">Couple Space</h2>
          <p className="settings-card-desc">Your private link connecting you and {partner ? partner.name : 'your partner'}.</p>

          {coupleMsg && <div className="settings-success-alert">{coupleMsg}</div>}

          <div className="couple-info-block">
            <div className="tm-form-group">
              <label className="tm-label">Unique Pairing Code</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="tm-input"
                  value={couple?.pairing_code || ''}
                  readOnly
                  style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.05em' }}
                />
                <button
                  type="button"
                  className="tm-btn tm-btn-secondary tm-btn-sm"
                  onClick={handleCopyCode}
                >
                  {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="tm-form-group">
              <label className="tm-label">Connection Status</label>
              <div className="connection-status-row">
                <span className={`status-indicator-dot ${isConnected ? 'active' : ''}`} />
                <span>{isConnected ? `Connected with ${partner?.name}` : 'Waiting for partner to join space'}</span>
              </div>
            </div>

            <form onSubmit={handleUpdateStartDate} style={{ marginTop: '20px' }}>
              <div className="tm-form-group">
                <label className="tm-label">Relationship Start Date</label>
                <input
                  type="date"
                  className="tm-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Used to celebrate your milestones and calculate days together on the Home dashboard.
                </span>
              </div>

              <button type="submit" className="tm-btn tm-btn-secondary tm-btn-sm">
                Update Relationship Date
              </button>
            </form>

            <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                type="button"
                className="tm-btn tm-btn-danger tm-btn-sm"
                onClick={handleLeaveCouple}
              >
                <Trash2 size={15} />
                <span>Disconnect Couple Space</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PRIVACY & SECURITY */}
      {activeSection === 'privacy' && (
        <div className="tm-card settings-card">
          <h2 className="settings-card-title">Privacy Principles</h2>
          <p className="settings-card-desc">TogetherMiles is built from the ground up for absolute intimacy and discretion.</p>

          <div className="privacy-items-list">
            <div className="privacy-item">
              <strong>End-to-End Relationship Isolation</strong>
              <p>Every message, love note, photo, and journal entry belongs strictly to your verified couple ID. No other account on the platform can ever query or discover your space.</p>
            </div>

            <div className="privacy-item">
              <strong>No Social Feeds & No Ad Trackers</strong>
              <p>We do not sell data, integrate behavioral ad trackers, or feature public follower mechanisms. It is purely for you and your partner.</p>
            </div>

            <div className="privacy-item">
              <strong>Time-Locked Secrecy</strong>
              <p>Love notes with unlock dates are strictly enforced on the server. The encrypted content is never exposed via API responses to the recipient until the unlock timestamp arrives.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: ACCOUNT */}
      {activeSection === 'account' && (
        <div className="tm-card settings-card">
          <h2 className="settings-card-title">Security & Password</h2>
          <p className="settings-card-desc">Keep your login credentials secure.</p>

          {passwordMsg && <div className="settings-success-alert">{passwordMsg}</div>}
          {passwordErr && <div className="settings-error-alert">{passwordErr}</div>}

          <form onSubmit={handleChangePassword}>
            <div className="tm-form-group">
              <label className="tm-label">Current Password</label>
              <input
                type="password"
                className="tm-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="tm-form-group">
              <label className="tm-label">New Password</label>
              <input
                type="password"
                className="tm-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="tm-btn tm-btn-secondary tm-btn-sm" style={{ marginTop: '10px' }}>
              Update Password
            </button>
          </form>

          <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Session Management</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Sign out of your active browser session on this device.
            </p>
            <button
              type="button"
              className="tm-btn tm-btn-secondary tm-btn-sm"
              onClick={logout}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <style>{`
        .settings-header {
          margin-bottom: 24px;
        }

        .settings-page-title {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          margin-bottom: 4px;
        }

        .settings-page-sub {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .settings-nav-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        .settings-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-card);
          border: 1px solid var(--border);
          font-size: 0.88rem;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }

        .settings-pill:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }

        .settings-pill.active {
          background-color: var(--accent-light);
          color: var(--accent);
          border-color: var(--accent-border);
          font-weight: 600;
        }

        .settings-card {
          padding: 32px 28px;
        }

        .settings-card-title {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }

        .settings-card-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .settings-success-alert {
          background-color: var(--success-bg);
          color: var(--success);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          margin-bottom: 20px;
        }

        .settings-error-alert {
          background-color: var(--danger-bg);
          color: var(--danger);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          margin-bottom: 20px;
        }

        .connection-status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .status-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: var(--text-muted);
        }

        .status-indicator-dot.active {
          background-color: var(--success);
        }

        .privacy-items-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .privacy-item strong {
          display: block;
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .privacy-item p {
          font-size: 0.88rem;
          line-height: 1.55;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
