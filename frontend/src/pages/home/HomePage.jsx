import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { socket } from '../../services/socket.js';
import { CountdownTimer } from '../../components/ui/CountdownTimer.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { 
  MessageCircle, 
  Image as ImageIcon, 
  Calendar, 
  MapPin, 
  Copy, 
  Check, 
  Heart, 
  Sparkles,
  ArrowRight,
  Clock,
  Send
} from 'lucide-react';

const MOODS = [
  { id: 'Happy', label: 'Happy', emoji: '☀️' },
  { id: 'Missing you', label: 'Missing you', emoji: '🤍' },
  { id: 'Tired', label: 'Tired', emoji: '🌙' },
  { id: 'Busy', label: 'Busy', emoji: '⏳' },
  { id: 'Sad', label: 'Sad', emoji: '🌧️' },
  { id: 'Need some time', label: 'Need some time', emoji: '🌿' },
  { id: 'Want to talk', label: 'Want to talk', emoji: '💬' }
];

export function HomePage({ setActiveTab }) {
  const { user, couple, partner, isConnected, createCouple, joinCouple, refreshUser } = useAuth();
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  
  // Pairing states (if single / not yet paired)
  const [pairingCodeInput, setPairingCodeInput] = useState('');
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [pairingError, setPairingError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // New Meeting modal state
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: 'Our Next Reunion',
    meetingAt: '',
    location: '',
    note: ''
  });

  const loadSummary = useCallback(async () => {
    if (!couple) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getHomeSummary();
      setHomeData(res.data);
    } catch (err) {
      console.error('[Home load summary error]', err);
    } finally {
      setLoading(false);
    }
  }, [couple]);

  useEffect(() => {
    loadSummary();

    const unsubCheckIn = socket.on('PARTNER_CHECK_IN', () => {
      loadSummary();
    });

    return () => {
      unsubCheckIn();
    };
  }, [loadSummary]);

  const handleSelectMood = async (mood) => {
    setSelectedMood(mood);
    setShowNoteModal(true);
  };

  const submitCheckInWithNote = async () => {
    if (!selectedMood) return;
    setSubmittingCheckIn(true);
    try {
      await api.createCheckIn({
        mood: selectedMood,
        note: checkInNote || null
      });
      setShowNoteModal(false);
      setCheckInNote('');
      await loadSummary();
    } catch (e) {
      console.error('Check-in error', e);
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const handleCreateCouple = async (e) => {
    e.preventDefault();
    setPairingError('');
    try {
      await createCouple({ relationshipStartDate: relationshipStartDate || null });
    } catch (err) {
      setPairingError(err.message);
    }
  };

  const handleJoinCouple = async (e) => {
    e.preventDefault();
    setPairingError('');
    try {
      await joinCouple(pairingCodeInput);
    } catch (err) {
      setPairingError(err.message);
    }
  };

  const copyPairingCode = () => {
    if (!couple?.pairing_code) return;
    navigator.clipboard.writeText(couple.pairing_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      await api.createMeeting(meetingForm);
      setShowMeetingModal(false);
      loadSummary();
    } catch (err) {
      alert(err.message);
    }
  };

  // If user has not yet created or joined a couple space
  if (!couple) {
    return (
      <div className="page-wrapper">
        <div className="home-greeting">
          <h1>Welcome, {user?.name}</h1>
          <p>Let's create your private space for two.</p>
        </div>

        {pairingError && <div className="auth-error-banner">{pairingError}</div>}

        <div className="pairing-grid">
          <div className="tm-card pairing-card">
            <h3>Start a New Space</h3>
            <p style={{ margin: '8px 0 20px' }}>
              Create a fresh shared room and receive a private pairing code to send to your partner.
            </p>
            <form onSubmit={handleCreateCouple}>
              <div className="tm-form-group">
                <label className="tm-label">Together Since (Optional)</label>
                <input
                  type="date"
                  className="tm-input"
                  value={relationshipStartDate}
                  onChange={(e) => setRelationshipStartDate(e.target.value)}
                />
              </div>
              <button type="submit" className="tm-btn tm-btn-primary tm-btn-full">
                Create Couple Space
              </button>
            </form>
          </div>

          <div className="tm-card pairing-card">
            <h3>Join Partner's Space</h3>
            <p style={{ margin: '8px 0 20px' }}>
              Enter the unique pairing code your partner shared with you.
            </p>
            <form onSubmit={handleJoinCouple}>
              <div className="tm-form-group">
                <label className="tm-label">Pairing Code</label>
                <input
                  type="text"
                  className="tm-input"
                  placeholder="e.g. TM-9X4-2KM"
                  value={pairingCodeInput}
                  onChange={(e) => setPairingCodeInput(e.target.value.toUpperCase())}
                  required
                />
              </div>
              <button type="submit" className="tm-btn tm-btn-secondary tm-btn-full">
                Connect Space
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If couple exists but partner has not yet joined
  if (!isConnected) {
    return (
      <div className="page-wrapper">
        <div className="home-greeting">
          <h1>Almost there, {user?.name}</h1>
          <p>Your space is ready. Invite your partner to step inside.</p>
        </div>

        <div className="tm-card invite-hero-card">
          <div className="invite-tag">PAIRING CODE</div>
          <div className="invite-code-box">
            <span className="code-text">{couple.pairing_code}</span>
            <button
              type="button"
              className="tm-btn tm-btn-secondary tm-btn-sm"
              onClick={copyPairingCode}
            >
              {copiedCode ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <p className="invite-instructions">
            Send this code to your partner. Once they sign in and enter this code, your private shared space will immediately unlock.
          </p>

          <div className="invite-waiting-badge">
            <span className="pulse-indicator"></span>
            Waiting for your partner to join...
          </div>
        </div>
      </div>
    );
  }

  const partnerCheckIn = homeData?.todayCheckIns?.find(c => c.user_id === partner?.id);
  const myCheckIn = homeData?.todayCheckIns?.find(c => c.user_id === user?.id);
  const nextMeeting = homeData?.nextMeeting;
  const upcomingDate = homeData?.upcomingDate;
  const recentMemory = homeData?.recentMemory;
  const daysTogether = homeData?.couple?.daysTogether;

  // Format greeting according to local time
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good evening';
  if (currentHour < 12) timeGreeting = 'Good morning';
  else if (currentHour < 17) timeGreeting = 'Good afternoon';

  return (
    <div className="page-wrapper">
      {/* 1. Partner Header */}
      <section className="home-header">
        <div className="header-greeting-block">
          <span className="greeting-sub">
            {timeGreeting}, {user?.name}
          </span>
          <h1 className="header-couple-title">
            You and {partner?.name}
          </h1>
          {daysTogether !== null && daysTogether !== undefined && (
            <p className="header-days-text">
              Together for <strong style={{ color: 'var(--text-primary)' }}>{daysTogether}</strong> days
              {couple.relationship_start_date && (
                <span> • Since {new Date(couple.relationship_start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              )}
            </p>
          )}
        </div>
      </section>

      <div className="home-sections-flow">
        {/* 2. Today's Check-in Section */}
        <section className="tm-card home-card">
          <div className="card-header-clean">
            <span className="section-label">TODAY'S CHECK-IN</span>
            {partnerCheckIn && (
              <span className="partner-status-tag">
                {partner?.name}: <strong>{partnerCheckIn.mood}</strong>
              </span>
            )}
          </div>

          <div className="checkin-mood-row">
            <p className="checkin-prompt">How are you doing right now?</p>
            <div className="mood-chips-container">
              {MOODS.map(m => {
                const isSelected = myCheckIn?.mood === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`mood-chip ${isSelected ? 'active' : ''}`}
                    onClick={() => handleSelectMood(m.id)}
                  >
                    <span>{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {myCheckIn?.note && (
              <div className="my-checkin-note">
                <span className="note-label">Your note today:</span>
                <p>"{myCheckIn.note}"</p>
              </div>
            )}

            {partnerCheckIn?.note && (
              <div className="partner-checkin-note">
                <span className="note-label">{partner?.name}'s note:</span>
                <p>"{partnerCheckIn.note}"</p>
              </div>
            )}
          </div>
        </section>

        {/* 3. Next Meeting Countdown Section */}
        <section className="tm-card home-card">
          <div className="card-header-clean">
            <span className="section-label">NEXT TIME TOGETHER</span>
            <button
              type="button"
              className="tm-btn tm-btn-ghost tm-btn-sm"
              onClick={() => setShowMeetingModal(true)}
            >
              {nextMeeting ? 'Update' : '+ Set Date'}
            </button>
          </div>

          {nextMeeting ? (
            <div className="meeting-content">
              <h2 className="meeting-title">{nextMeeting.title}</h2>
              <CountdownTimer targetDate={nextMeeting.meeting_at} />
              <div className="meeting-metadata">
                <div className="meta-item">
                  <Calendar size={15} />
                  <span>
                    {new Date(nextMeeting.meeting_at).toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {nextMeeting.location && (
                  <div className="meta-item">
                    <MapPin size={15} />
                    <span>{nextMeeting.location}</span>
                  </div>
                )}
              </div>
              {nextMeeting.note && (
                <p className="meeting-note">"{nextMeeting.note}"</p>
              )}
            </div>
          ) : (
            <div className="meeting-empty-mini">
              <p>No countdown set yet.</p>
              <button
                type="button"
                className="tm-btn tm-btn-secondary tm-btn-sm"
                onClick={() => setShowMeetingModal(true)}
              >
                Plan next reunion
              </button>
            </div>
          )}
        </section>

        {/* 4. Upcoming Date Card & Quick Actions Grid */}
        <div className="home-subgrid">
          {/* Upcoming Date */}
          <section className="tm-card sub-card">
            <span className="section-label">UPCOMING MILESTONE</span>
            {upcomingDate ? (
              <div className="upcoming-date-box">
                <h3 className="upcoming-title">{upcomingDate.title}</h3>
                <span className="upcoming-days-badge">
                  {upcomingDate.days_until === 0 ? 'Today!' : `in ${upcomingDate.days_until} days`}
                </span>
                <p className="upcoming-date-text">
                  {new Date(upcomingDate.next_occurrence || upcomingDate.date).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ) : (
              <div className="upcoming-empty">
                <p>No upcoming dates recorded.</p>
                <button
                  type="button"
                  className="tm-btn tm-btn-ghost tm-btn-sm"
                  onClick={() => setActiveTab('together')}
                >
                  Add important date
                </button>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className="tm-card sub-card">
            <span className="section-label">QUICK CONNECT</span>
            <div className="quick-actions-list">
              <button
                type="button"
                className="quick-action-item"
                onClick={() => setActiveTab('chat')}
              >
                <MessageCircle size={18} color="var(--accent)" />
                <span>Send message</span>
                <ArrowRight size={14} className="action-arrow" />
              </button>
              <button
                type="button"
                className="quick-action-item"
                onClick={() => setActiveTab('memories')}
              >
                <ImageIcon size={18} color="var(--accent)" />
                <span>Add memory</span>
                <ArrowRight size={14} className="action-arrow" />
              </button>
              <button
                type="button"
                className="quick-action-item"
                onClick={() => setActiveTab('together')}
              >
                <Heart size={18} color="var(--accent)" />
                <span>Leave a love note</span>
                <ArrowRight size={14} className="action-arrow" />
              </button>
            </div>
          </section>
        </div>

        {/* 5. Recent Memory Section */}
        {recentMemory && (
          <section className="tm-card home-card">
            <div className="card-header-clean">
              <span className="section-label">RECENT MEMORY</span>
              <button
                type="button"
                className="tm-btn tm-btn-ghost tm-btn-sm"
                onClick={() => setActiveTab('memories')}
              >
                View all memories
              </button>
            </div>

            <div className="recent-memory-layout">
              {recentMemory.image_url && (
                <div className="recent-memory-image-wrap">
                  <img src={recentMemory.image_url} alt={recentMemory.title} />
                </div>
              )}
              <div className="recent-memory-details">
                <span className="recent-memory-date">
                  {new Date(recentMemory.memory_date).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  {recentMemory.location && ` • ${recentMemory.location}`}
                </span>
                <h3 className="recent-memory-title">"{recentMemory.title}"</h3>
                {recentMemory.description && (
                  <p className="recent-memory-desc">{recentMemory.description}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Check-in Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title={`Checking in: ${selectedMood}`}
      >
        <div>
          <p style={{ marginBottom: '14px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Add an optional note for {partner?.name} if you wish:
          </p>
          <div className="tm-form-group">
            <textarea
              className="tm-textarea"
              placeholder="e.g. Thinking of you while walking to work..."
              value={checkInNote}
              onChange={(e) => setCheckInNote(e.target.value)}
              rows={3}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="tm-btn tm-btn-ghost"
              onClick={submitCheckInWithNote}
              disabled={submittingCheckIn}
            >
              Skip note
            </button>
            <button
              type="button"
              className="tm-btn tm-btn-primary"
              onClick={submitCheckInWithNote}
              disabled={submittingCheckIn}
            >
              Save Check-in
            </button>
          </div>
        </div>
      </Modal>

      {/* Meeting Planning Modal */}
      <Modal
        isOpen={showMeetingModal}
        onClose={() => setShowMeetingModal(false)}
        title={nextMeeting ? 'Update Next Meeting' : 'Plan Next Reunion'}
      >
        <form onSubmit={handleCreateMeeting}>
          <div className="tm-form-group">
            <label className="tm-label">Title</label>
            <input
              type="text"
              className="tm-input"
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Date and Time</label>
            <input
              type="datetime-local"
              className="tm-input"
              value={meetingForm.meetingAt}
              onChange={(e) => setMeetingForm({ ...meetingForm, meetingAt: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Location (Optional)</label>
            <input
              type="text"
              className="tm-input"
              placeholder="e.g. London Heathrow Terminal 5"
              value={meetingForm.location}
              onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Personal Note (Optional)</label>
            <input
              type="text"
              className="tm-input"
              placeholder="e.g. Can't wait for your hug"
              value={meetingForm.note}
              onChange={(e) => setMeetingForm({ ...meetingForm, note: e.target.value })}
            />
          </div>

          <button type="submit" className="tm-btn tm-btn-primary tm-btn-full" style={{ marginTop: '10px' }}>
            Save Reunion Date
          </button>
        </form>
      </Modal>

      <style>{`
        .home-header {
          margin-bottom: 24px;
        }

        .greeting-sub {
          font-size: 0.88rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .header-couple-title {
          font-family: var(--font-serif);
          font-size: 2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 2px 0 4px;
        }

        .header-days-text {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .home-sections-flow {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card-header-clean {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted);
        }

        .partner-status-tag {
          font-size: 0.82rem;
          color: var(--accent);
          background-color: var(--accent-light);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--accent-border);
        }

        .checkin-prompt {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .mood-chips-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mood-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          background-color: var(--bg-subtle);
          border: 1px solid var(--border-subtle);
          font-size: 0.88rem;
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }

        .mood-chip:hover {
          border-color: var(--border-strong);
          background-color: var(--bg-hover);
        }

        .mood-chip.active {
          background-color: var(--accent);
          color: var(--text-inverse);
          border-color: var(--accent);
          font-weight: 500;
        }

        .my-checkin-note, .partner-checkin-note {
          margin-top: 14px;
          padding: 10px 14px;
          background-color: var(--bg-subtle);
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
        }

        .partner-checkin-note {
          border-left: 3px solid var(--accent);
        }

        .note-label {
          display: block;
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 2px;
        }

        .meeting-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .meeting-metadata {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meeting-note {
          font-style: italic;
          margin-top: 10px;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .meeting-empty-mini {
          text-align: center;
          padding: 16px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
        }

        .home-subgrid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        @media (min-width: 640px) {
          .home-subgrid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .upcoming-date-box {
          margin-top: 8px;
        }

        .upcoming-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .upcoming-days-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 600;
          background-color: var(--accent-light);
          color: var(--accent);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          margin-bottom: 8px;
        }

        .upcoming-date-text {
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .upcoming-empty {
          margin-top: 12px;
          color: var(--text-muted);
          font-size: 0.88rem;
        }

        .quick-actions-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }

        .quick-action-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background-color: var(--bg-subtle);
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-primary);
          transition: background-color var(--transition-fast);
        }

        .quick-action-item:hover {
          background-color: var(--bg-hover);
        }

        .action-arrow {
          margin-left: auto;
          color: var(--text-muted);
        }

        .recent-memory-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        @media (min-width: 600px) {
          .recent-memory-layout {
            flex-direction: row;
            align-items: center;
          }
        }

        .recent-memory-image-wrap {
          width: 100%;
          max-width: 180px;
          height: 120px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background-color: var(--bg-subtle);
        }

        .recent-memory-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .recent-memory-details {
          flex: 1;
        }

        .recent-memory-date {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .recent-memory-title {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          margin: 4px 0 6px;
        }

        .recent-memory-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Pairing invitation cards */
        .pairing-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 24px;
        }

        @media (min-width: 640px) {
          .pairing-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .invite-hero-card {
          text-align: center;
          padding: 48px 32px;
          max-width: 540px;
          margin: 32px auto 0;
        }

        .invite-tag {
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 12px;
        }

        .invite-code-box {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          background-color: var(--bg-subtle);
          border: 1px dashed var(--accent-border);
          padding: 14px 24px;
          border-radius: var(--radius-md);
          margin-bottom: 16px;
        }

        .code-text {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-primary);
          font-family: monospace;
        }

        .invite-instructions {
          font-size: 0.92rem;
          color: var(--text-secondary);
          max-width: 420px;
          margin: 0 auto 24px;
          line-height: 1.5;
        }

        .invite-waiting-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: var(--text-muted);
          background-color: var(--bg-subtle);
          padding: 6px 14px;
          border-radius: var(--radius-full);
        }

        .pulse-indicator {
          width: 7px;
          height: 7px;
          border-radius: var(--radius-full);
          background-color: var(--accent);
          animation: tmPulse 1.8s infinite;
        }

        @keyframes tmPulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
