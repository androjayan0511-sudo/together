-- TogetherMiles Database Schema
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Couples table
CREATE TABLE IF NOT EXISTS couples (
  id TEXT PRIMARY KEY,
  pairing_code TEXT NOT NULL UNIQUE,
  user_one_id TEXT NOT NULL,
  user_two_id TEXT,
  relationship_start_date TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_couples_pairing_code ON couples(pairing_code);
CREATE INDEX IF NOT EXISTS idx_couples_user_one ON couples(user_one_id);
CREATE INDEX IF NOT EXISTS idx_couples_user_two ON couples(user_two_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at TEXT NOT NULL,
  read_at TEXT,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_couple_created ON messages(couple_id, created_at);

-- Daily Check-ins table
CREATE TABLE IF NOT EXISTS check_ins (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  mood TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_check_ins_couple_created ON check_ins(couple_id, created_at);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_created ON check_ins(user_id, created_at);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  memory_date TEXT NOT NULL,
  location TEXT,
  image_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_memories_couple_date ON memories(couple_id, memory_date DESC);

-- Love Notes table (with strict unlock date support)
CREATE TABLE IF NOT EXISTS love_notes (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  recipient_id TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  unlock_at TEXT,
  opened_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_love_notes_couple ON love_notes(couple_id);

-- Important Dates table
CREATE TABLE IF NOT EXISTS important_dates (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL, -- 'anniversary', 'birthday', 'first_met', 'custom'
  reminder_enabled INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_important_dates_couple ON important_dates(couple_id, date);

-- Next Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  title TEXT NOT NULL,
  meeting_at TEXT NOT NULL,
  location TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meetings_couple ON meetings(couple_id, meeting_at DESC);

-- Shared Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  author_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_couple ON journal_entries(couple_id, created_at DESC);

-- Activities table (curated remote activities)
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'watch', 'questions', 'dinner', 'photo', 'game'
  created_at TEXT NOT NULL
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
