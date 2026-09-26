# TogetherMiles — Database Specification

TogetherMiles utilizes an indexed relational database with cascading foreign key enforcement and Write-Ahead Logging (WAL) for high concurrency and immediate persistence.

---

## Entity Relationship Diagram

```
[ users ]
   │
   ├── (user_one_id) ────────┐
   └── (user_two_id) ──┐     │
                       ▼     ▼
                    [ couples ]
                       │
       ┌───────────────┼───────────────┬────────────────┬───────────────┐
       ▼               ▼               ▼                ▼               ▼
  [ messages ]   [ check_ins ]   [ memories ]    [ love_notes ]  [ important_dates ]
       │                                                │
       ▼                                                ▼
  [ meetings ]                                  [ journal_entries ]
```

---

## Tables & Schema

### `users`
* `id`: TEXT PRIMARY KEY
* `name`: TEXT NOT NULL
* `email`: TEXT NOT NULL UNIQUE
* `password_hash`: TEXT NOT NULL
* `avatar_url`: TEXT
* `timezone`: TEXT DEFAULT 'UTC'
* `created_at`: TEXT NOT NULL
* `updated_at`: TEXT NOT NULL

### `couples`
* `id`: TEXT PRIMARY KEY
* `pairing_code`: TEXT NOT NULL UNIQUE (e.g. `TM-7X9-K42`)
* `user_one_id`: TEXT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
* `user_two_id`: TEXT REFERENCES `users(id)` ON DELETE SET NULL
* `relationship_start_date`: TEXT
* `created_at`: TEXT NOT NULL
* `updated_at`: TEXT NOT NULL

### `messages`
* `id`: TEXT PRIMARY KEY
* `couple_id`: TEXT NOT NULL REFERENCES `couples(id)` ON DELETE CASCADE
* `sender_id`: TEXT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
* `content`: TEXT NOT NULL
* `message_type`: TEXT DEFAULT 'text'
* `created_at`: TEXT NOT NULL
* `read_at`: TEXT

### `check_ins`
* `id`: TEXT PRIMARY KEY
* `couple_id`: TEXT NOT NULL REFERENCES `couples(id)` ON DELETE CASCADE
* `user_id`: TEXT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
* `mood`: TEXT NOT NULL
* `note`: TEXT
* `created_at`: TEXT NOT NULL

### `memories`
* `id`: TEXT PRIMARY KEY
* `couple_id`: TEXT NOT NULL REFERENCES `couples(id)` ON DELETE CASCADE
* `created_by`: TEXT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
* `title`: TEXT NOT NULL
* `description`: TEXT
* `memory_date`: TEXT NOT NULL
* `location`: TEXT
* `image_url`: TEXT
* `created_at`: TEXT NOT NULL
* `updated_at`: TEXT NOT NULL

### `love_notes`
* `id`: TEXT PRIMARY KEY
* `couple_id`: TEXT NOT NULL REFERENCES `couples(id)` ON DELETE CASCADE
* `sender_id`: TEXT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
* `recipient_id`: TEXT REFERENCES `users(id)` ON DELETE SET NULL
* `title`: TEXT NOT NULL
* `content`: TEXT NOT NULL
* `unlock_at`: TEXT (enforced time-lock)
* `opened_at`: TEXT
* `created_at`: TEXT NOT NULL

### `important_dates`
* `id`: TEXT PRIMARY KEY
* `couple_id`: TEXT NOT NULL REFERENCES `couples(id)` ON DELETE CASCADE
* `title`: TEXT NOT NULL
* `date`: TEXT NOT NULL
* `type`: TEXT NOT NULL
* `reminder_enabled`: INTEGER DEFAULT 1
* `created_at`: TEXT NOT NULL

### `meetings`
* `id`: TEXT PRIMARY KEY
* `couple_id`: TEXT NOT NULL REFERENCES `couples(id)` ON DELETE CASCADE
* `title`: TEXT NOT NULL
* `meeting_at`: TEXT NOT NULL
* `location`: TEXT
* `note`: TEXT
* `created_at`: TEXT NOT NULL

### `journal_entries`
* `id`: TEXT PRIMARY KEY
* `couple_id`: TEXT NOT NULL REFERENCES `couples(id)` ON DELETE CASCADE
* `author_id`: TEXT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
* `title`: TEXT NOT NULL
* `content`: TEXT NOT NULL
* `created_at`: TEXT NOT NULL
* `updated_at`: TEXT NOT NULL

### `activities`
* `id`: TEXT PRIMARY KEY
* `title`: TEXT NOT NULL
* `description`: TEXT NOT NULL
* `category`: TEXT NOT NULL
* `created_at`: TEXT NOT NULL

### `notifications`
* `id`: TEXT PRIMARY KEY
* `user_id`: TEXT NOT NULL REFERENCES `users(id)` ON DELETE CASCADE
* `type`: TEXT NOT NULL
* `title`: TEXT NOT NULL
* `body`: TEXT NOT NULL
* `read_at`: TEXT
* `created_at`: TEXT NOT NULL
