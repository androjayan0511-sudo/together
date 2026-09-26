import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { 
  Heart, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  Lock, 
  Unlock, 
  Plus, 
  Clock, 
  Trash2, 
  Check, 
  ArrowRight,
  Tv,
  HelpCircle,
  Utensils,
  Camera,
  Gamepad2
} from 'lucide-react';

export function TogetherPage({ setActiveTab }) {
  const { user, partner, couple } = useAuth();
  const [subTab, setSubTab] = useState('notes'); // 'notes' | 'journal' | 'dates' | 'activities'

  // Love Notes State
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', unlockAt: '' });

  // Journal State
  const [journalEntries, setJournalEntries] = useState([]);
  const [loadingJournal, setLoadingJournal] = useState(false);
  const [showAddJournalModal, setShowAddJournalModal] = useState(false);
  const [journalForm, setJournalForm] = useState({ title: '', content: '' });

  // Dates State
  const [dates, setDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [showAddDateModal, setShowAddDateModal] = useState(false);
  const [dateForm, setDateForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'anniversary'
  });

  // Activities State
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Load Love Notes
  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const res = await api.getLoveNotes();
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotes(false);
    }
  };

  // Load Journal
  const loadJournal = async () => {
    try {
      setLoadingJournal(true);
      const res = await api.getJournalEntries();
      setJournalEntries(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingJournal(false);
    }
  };

  // Load Dates
  const loadDates = async () => {
    try {
      setLoadingDates(true);
      const res = await api.getDates();
      setDates(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDates(false);
    }
  };

  // Load Activities
  const loadActivities = async () => {
    try {
      setLoadingActivities(true);
      const res = await api.getActivities();
      setActivities(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    if (!couple) return;
    if (subTab === 'notes') loadNotes();
    if (subTab === 'journal') loadJournal();
    if (subTab === 'dates') loadDates();
    if (subTab === 'activities') loadActivities();
  }, [couple, subTab]);

  // Handlers for Love Notes
  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      await api.createLoveNote(noteForm);
      setShowAddNoteModal(false);
      setNoteForm({ title: '', content: '', unlockAt: '' });
      loadNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenNote = async (note) => {
    if (note.is_locked) {
      setSelectedNote(note);
      return;
    }
    try {
      const res = await api.getLoveNote(note.id);
      setSelectedNote(res.data);
      loadNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this love note?')) return;
    try {
      await api.deleteLoveNote(id);
      loadNotes();
      if (selectedNote?.id === id) setSelectedNote(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers for Journal
  const handleCreateJournal = async (e) => {
    e.preventDefault();
    try {
      await api.createJournalEntry(journalForm);
      setShowAddJournalModal(false);
      setJournalForm({ title: '', content: '' });
      loadJournal();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteJournal = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this journal entry?')) return;
    try {
      await api.deleteJournalEntry(id);
      loadJournal();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handlers for Dates
  const handleCreateDate = async (e) => {
    e.preventDefault();
    try {
      await api.createDate(dateForm);
      setShowAddDateModal(false);
      setDateForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'anniversary'
      });
      loadDates();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDate = async (id) => {
    if (!window.confirm('Remove this date?')) return;
    try {
      await api.deleteDate(id);
      loadDates();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartActivity = async (act) => {
    try {
      await api.sendMessage({
        content: `Let's do this together: "${act.title}" — ${act.description}`
      });
      setActiveTab('chat');
    } catch (err) {
      console.error(err);
    }
  };

  const getActivityIcon = (category) => {
    switch (category) {
      case 'watch': return Tv;
      case 'questions': return HelpCircle;
      case 'dinner': return Utensils;
      case 'photo': return Camera;
      case 'game': return Gamepad2;
      default: return Sparkles;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="together-header">
        <h1 className="together-page-title">Together</h1>
        <p className="together-page-sub">Private letters, shared thoughts, special milestones, and remote rituals.</p>

        {/* Sub-navigation tabs */}
        <div className="sub-nav-tabs">
          <button
            type="button"
            className={`sub-nav-tab ${subTab === 'notes' ? 'active' : ''}`}
            onClick={() => setSubTab('notes')}
          >
            <Heart size={16} />
            <span>Love Notes</span>
          </button>
          <button
            type="button"
            className={`sub-nav-tab ${subTab === 'journal' ? 'active' : ''}`}
            onClick={() => setSubTab('journal')}
          >
            <BookOpen size={16} />
            <span>Shared Journal</span>
          </button>
          <button
            type="button"
            className={`sub-nav-tab ${subTab === 'dates' ? 'active' : ''}`}
            onClick={() => setSubTab('dates')}
          >
            <Calendar size={16} />
            <span>Important Dates</span>
          </button>
          <button
            type="button"
            className={`sub-nav-tab ${subTab === 'activities' ? 'active' : ''}`}
            onClick={() => setSubTab('activities')}
          >
            <Sparkles size={16} />
            <span>Activities</span>
          </button>
        </div>
      </div>

      {/* SUB-SECTION 1: LOVE NOTES */}
      {subTab === 'notes' && (
        <div>
          <div className="sub-action-bar">
            <span className="sub-count">{notes.length} note{notes.length === 1 ? '' : 's'}</span>
            <button
              type="button"
              className="tm-btn tm-btn-primary tm-btn-sm"
              onClick={() => setShowAddNoteModal(true)}
            >
              <Plus size={16} />
              <span>Write Note</span>
            </button>
          </div>

          {loadingNotes ? (
            <div className="notes-grid">
              {[1, 2].map(i => <div key={i} className="tm-card tm-skeleton" style={{ height: '140px' }} />)}
            </div>
          ) : notes.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No love notes yet."
              description="Leave a private letter or a note locked until a future date or anniversary."
              actionText="Write a love note"
              onAction={() => setShowAddNoteModal(true)}
            />
          ) : (
            <div className="notes-grid">
              {notes.map((note) => {
                const isLocked = note.is_locked;
                return (
                  <div
                    key={note.id}
                    className={`tm-card note-card ${isLocked ? 'note-locked' : 'note-unlocked'}`}
                    onClick={() => handleOpenNote(note)}
                  >
                    <div className="note-card-top">
                      <span className="note-author-tag">
                        {note.is_sender ? 'From you' : `From ${note.sender_name}`}
                      </span>
                      {isLocked ? (
                        <span className="lock-pill">
                          <Lock size={12} />
                          Locked
                        </span>
                      ) : (
                        <span className="unlocked-pill">
                          <Unlock size={12} />
                          {note.opened_at ? 'Opened' : 'New'}
                        </span>
                      )}
                    </div>

                    <h3 className="note-card-title">{note.title}</h3>

                    {isLocked ? (
                      <div className="locked-message-box">
                        <p>This note is waiting for you.</p>
                        <span>Opens {new Date(note.unlock_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    ) : (
                      <p className="note-card-snippet">
                        {note.content ? `"${note.content.slice(0, 100)}${note.content.length > 100 ? '...' : ''}"` : 'Tap to read'}
                      </p>
                    )}

                    <div className="note-card-bottom">
                      <span className="note-created-date">
                        {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      {note.is_sender && (
                        <button
                          type="button"
                          className="memory-delete-btn"
                          onClick={(e) => handleDeleteNote(note.id, e)}
                          aria-label="Delete note"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION 2: SHARED JOURNAL */}
      {subTab === 'journal' && (
        <div>
          <div className="sub-action-bar">
            <span className="sub-count">{journalEntries.length} reflection{journalEntries.length === 1 ? '' : 's'}</span>
            <button
              type="button"
              className="tm-btn tm-btn-primary tm-btn-sm"
              onClick={() => setShowAddJournalModal(true)}
            >
              <Plus size={16} />
              <span>New Entry</span>
            </button>
          </div>

          {loadingJournal ? (
            <div className="journal-stream">
              {[1, 2].map(i => <div key={i} className="tm-card tm-skeleton" style={{ height: '160px' }} />)}
            </div>
          ) : journalEntries.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Your shared journal is empty."
              description="Write something you'll want to remember: a reflection on distance, a quiet thought, or plans for tomorrow."
              actionText="Write first entry"
              onAction={() => setShowAddJournalModal(true)}
            />
          ) : (
            <div className="journal-stream">
              {journalEntries.map((entry) => {
                const isAuthor = entry.author_id === user?.id;
                return (
                  <article key={entry.id} className="tm-card journal-card">
                    <div className="journal-meta-row">
                      <span className="journal-date">
                        {new Date(entry.created_at).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="journal-author">Written by {entry.author_name}</span>
                    </div>

                    <h3 className="journal-entry-title">{entry.title}</h3>
                    <p className="journal-entry-body">{entry.content}</p>

                    {isAuthor && (
                      <div className="journal-card-actions">
                        <button
                          type="button"
                          className="memory-delete-btn"
                          onClick={(e) => handleDeleteJournal(entry.id, e)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION 3: IMPORTANT DATES */}
      {subTab === 'dates' && (
        <div>
          <div className="sub-action-bar">
            <span className="sub-count">{dates.length} date{dates.length === 1 ? '' : 's'}</span>
            <button
              type="button"
              className="tm-btn tm-btn-primary tm-btn-sm"
              onClick={() => setShowAddDateModal(true)}
            >
              <Plus size={16} />
              <span>Add Date</span>
            </button>
          </div>

          {loadingDates ? (
            <div className="dates-grid">
              {[1, 2, 3].map(i => <div key={i} className="tm-card tm-skeleton" style={{ height: '100px' }} />)}
            </div>
          ) : dates.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No upcoming dates."
              description="Keep track of anniversaries, birthdays, your first meeting date, or custom countdowns."
              actionText="Add important date"
              onAction={() => setShowAddDateModal(true)}
            />
          ) : (
            <div className="dates-grid">
              {dates.map((d) => (
                <div key={d.id} className="tm-card date-card">
                  <div className="date-card-left">
                    <span className="date-type-tag">{d.type}</span>
                    <h3 className="date-card-title">{d.title}</h3>
                    <p className="date-card-formatted">
                      {new Date(d.next_occurrence || d.date).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="date-card-right">
                    <span className="days-until-pill">
                      {d.days_until === 0 ? 'Today!' : `${d.days_until} days`}
                    </span>
                    <button
                      type="button"
                      className="memory-delete-btn"
                      onClick={() => handleDeleteDate(d.id)}
                      aria-label="Delete date"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-SECTION 4: COUPLE ACTIVITIES */}
      {subTab === 'activities' && (
        <div>
          <div className="activities-intro">
            <p>Thoughtful remote rituals designed to bring calm and closeness across the miles.</p>
          </div>

          <div className="activities-grid">
            {activities.map((act) => {
              const Icon = getActivityIcon(act.category);
              return (
                <div key={act.id} className="tm-card activity-card">
                  <div className="activity-icon-wrap">
                    <Icon size={22} color="var(--accent)" />
                  </div>
                  <h3 className="activity-title">{act.title}</h3>
                  <p className="activity-description">{act.description}</p>
                  <button
                    type="button"
                    className="tm-btn tm-btn-secondary tm-btn-sm tm-btn-full"
                    onClick={() => handleStartActivity(act)}
                    style={{ marginTop: 'auto' }}
                  >
                    <span>Suggest in Chat</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write Love Note Modal */}
      <Modal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        title="Write a Love Note"
      >
        <form onSubmit={handleCreateNote}>
          <div className="tm-form-group">
            <label className="tm-label">Note Title</label>
            <input
              type="text"
              className="tm-input"
              placeholder="e.g. Open when you feel overwhelmed"
              value={noteForm.title}
              onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Unlock Date (Optional)</label>
            <input
              type="date"
              className="tm-input"
              value={noteForm.unlockAt}
              onChange={(e) => setNoteForm({ ...noteForm, unlockAt: e.target.value })}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              If set in the future, your partner cannot unlock or read this note until that exact day.
            </span>
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Letter Content</label>
            <textarea
              className="tm-textarea"
              placeholder="Write your heart out..."
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              rows={5}
              required
            />
          </div>

          <button type="submit" className="tm-btn tm-btn-primary tm-btn-full">
            Seal Note for {partner?.name}
          </button>
        </form>
      </Modal>

      {/* Read Love Note Modal */}
      {selectedNote && (
        <Modal
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          title={selectedNote.title}
        >
          {selectedNote.is_locked ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="tm-empty-icon" style={{ backgroundColor: 'var(--accent-light)' }}>
                <Lock size={22} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '8px' }}>This note is waiting for you.</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Opens on {new Date(selectedNote.unlock_at).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Written by {selectedNote.sender_name || 'your partner'} on {new Date(selectedNote.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: '1.05rem',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
                background: 'var(--bg-subtle)',
                padding: '20px',
                borderRadius: 'var(--radius-sm)'
              }}>
                {selectedNote.content}
              </p>
            </div>
          )}
        </Modal>
      )}

      {/* New Journal Entry Modal */}
      <Modal
        isOpen={showAddJournalModal}
        onClose={() => setShowAddJournalModal(false)}
        title="New Journal Reflection"
      >
        <form onSubmit={handleCreateJournal}>
          <div className="tm-form-group">
            <label className="tm-label">Entry Title</label>
            <input
              type="text"
              className="tm-input"
              placeholder="e.g. Rainy evening in the city"
              value={journalForm.title}
              onChange={(e) => setJournalForm({ ...journalForm, title: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Reflection</label>
            <textarea
              className="tm-textarea"
              placeholder="What are you noticing, feeling, or learning right now?"
              value={journalForm.content}
              onChange={(e) => setJournalForm({ ...journalForm, content: e.target.value })}
              rows={6}
              required
            />
          </div>

          <button type="submit" className="tm-btn tm-btn-primary tm-btn-full">
            Save Journal Entry
          </button>
        </form>
      </Modal>

      {/* Add Date Modal */}
      <Modal
        isOpen={showAddDateModal}
        onClose={() => setShowAddDateModal(false)}
        title="Add Important Date"
      >
        <form onSubmit={handleCreateDate}>
          <div className="tm-form-group">
            <label className="tm-label">Event Title</label>
            <input
              type="text"
              className="tm-input"
              placeholder="e.g. Anniversary / Maya's Birthday"
              value={dateForm.title}
              onChange={(e) => setDateForm({ ...dateForm, title: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Date</label>
            <input
              type="date"
              className="tm-input"
              value={dateForm.date}
              onChange={(e) => setDateForm({ ...dateForm, date: e.target.value })}
              required
            />
          </div>

          <div className="tm-form-group">
            <label className="tm-label">Category</label>
            <select
              className="tm-select"
              value={dateForm.type}
              onChange={(e) => setDateForm({ ...dateForm, type: e.target.value })}
            >
              <option value="anniversary">Anniversary</option>
              <option value="birthday">Birthday</option>
              <option value="first_met">First Meeting</option>
              <option value="custom">Custom Milestone</option>
            </select>
          </div>

          <button type="submit" className="tm-btn tm-btn-primary tm-btn-full">
            Save Important Date
          </button>
        </form>
      </Modal>

      <style>{`
        .together-header {
          margin-bottom: 24px;
        }

        .together-page-title {
          font-family: var(--font-serif);
          font-size: 1.85rem;
          margin-bottom: 4px;
        }

        .together-page-sub {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
        }

        .sub-nav-tabs {
          display: flex;
          gap: 6px;
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .sub-nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--text-secondary);
          border-bottom: 2px solid transparent;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .sub-nav-tab:hover {
          color: var(--text-primary);
        }

        .sub-nav-tab.active {
          color: var(--accent);
          font-weight: 600;
          border-bottom-color: var(--accent);
        }

        .sub-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 20px 0 16px;
        }

        .sub-count {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Love Notes Styles */
        .notes-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 600px) {
          .notes-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .note-card {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .note-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .note-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .note-author-tag {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .lock-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          background-color: var(--bg-tertiary);
          color: var(--text-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .unlocked-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          background-color: var(--accent-light);
          color: var(--accent);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .note-card-title {
          font-family: var(--font-serif);
          font-size: 1.15rem;
          margin-bottom: 8px;
        }

        .locked-message-box {
          background-color: var(--bg-subtle);
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          margin: 6px 0 14px;
          text-align: center;
        }

        .locked-message-box span {
          display: block;
          font-size: 0.76rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .note-card-snippet {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          font-style: italic;
          margin-bottom: 16px;
        }

        .note-card-bottom {
          margin-top: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
        }

        .note-created-date {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        /* Journal Stream Styles */
        .journal-stream {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .journal-card {
          position: relative;
        }

        .journal-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .journal-entry-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          margin-bottom: 10px;
        }

        .journal-entry-body {
          font-size: 0.94rem;
          color: var(--text-secondary);
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .journal-card-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 12px;
          padding-top: 8px;
          border-top: 1px solid var(--border-subtle);
        }

        /* Dates Grid Styles */
        .dates-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }

        @media (min-width: 600px) {
          .dates-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .date-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
        }

        .date-type-tag {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--accent);
          display: block;
          margin-bottom: 2px;
        }

        .date-card-title {
          font-size: 1.05rem;
          font-weight: 600;
        }

        .date-card-formatted {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .date-card-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .days-until-pill {
          background-color: var(--accent-light);
          color: var(--accent);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--accent-border);
        }

        /* Activities Grid Styles */
        .activities-intro {
          margin-bottom: 20px;
          font-size: 0.92rem;
          color: var(--text-secondary);
        }

        .activities-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }

        @media (min-width: 640px) {
          .activities-grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        .activity-card {
          display: flex;
          flex-direction: column;
          padding: 22px;
        }

        .activity-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-sm);
          background-color: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .activity-title {
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .activity-description {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
