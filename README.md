# TogetherMiles — A Private Space for Two

A calm, minimal, production-quality web application for two people in a long-distance relationship. Every feature is built with a clear purpose.

---

## Getting Started

### Prerequisites
- Node.js v20+ (already installed via winget)

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set a strong `JWT_SECRET` for production.

### 3. Start the Application

**Terminal 1 — Backend Server:**
```bash
cd backend
npm run dev
```
Backend runs at: `http://localhost:5000`

**Terminal 2 — Frontend Dev Server:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

The database file is auto-created at `database/togethermiles.db` on first start.

---

## Quick Demo Flow

1. Open `http://localhost:5173`
2. Register as **Andro** (`andro@togethermiles.com` / `together123`)
3. Click **Create Couple Space** — copy the pairing code
4. Open a second browser window (incognito)
5. Register as **Maya** (`maya@togethermiles.com` / `together123`)
6. Click **Join Partner's Space** and enter the pairing code
7. Both accounts are now connected. Explore the app.

---

## Features

| Feature | Status |
|---|---|
| Registration & Login | ✅ |
| Couple pairing with unique code | ✅ |
| Real-time chat (WebSocket) | ✅ |
| Live typing indicators | ✅ |
| Read receipts | ✅ |
| Daily emotional check-in | ✅ |
| Shared memory archive with photos | ✅ |
| Next meeting countdown | ✅ |
| Important date tracking | ✅ |
| Love notes with time-locks | ✅ |
| Shared journal | ✅ |
| Curated remote activities | ✅ |
| In-app notifications | ✅ |
| Responsive design (mobile + desktop) | ✅ |
| Couple authorization on all routes | ✅ |

---

## Running Tests

```bash
node --test tests/togethermiles.test.js
```

All 8 test suites pass (Authentication, Couple Pairing, Chat, Check-ins, Memories, Love Notes, Dates & Meetings, Journal).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 |
| Styling | Vanilla CSS with design tokens |
| Backend | Node.js + Express |
| Database | SQLite via native `node:sqlite` |
| Real-time | WebSocket (`ws` library) |
| Auth | JWT + bcryptjs |
| File uploads | Multer (MIME-validated, 5MB limit) |

---

## Project Structure

```
togethermiles/
├── backend/
│   ├── app/
│   │   ├── api/          # Route controllers
│   │   ├── config/       # DB + environment config
│   │   ├── middleware/   # Auth + couple guards
│   │   ├── repositories/ # Pure data access layer
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Crypto, errors, uploads
│   │   └── websocket/    # WebSocket room manager
│   ├── uploads/          # Image storage
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/   # UI primitives
│       ├── context/      # Auth state
│       ├── pages/        # Home, Chat, Memories, Together, Settings
│       └── services/     # API client + WebSocket client
├── database/
│   ├── migrations/       # Schema SQL
│   ├── seeds/            # Activity seed data
│   └── db.js             # Connection + migration runner
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── database.md
├── tests/
│   └── togethermiles.test.js
├── .env.example
└── README.md
```

---

## Privacy

TogetherMiles treats all relationship data as deeply sensitive:

- Every API endpoint verifies `AUTHENTICATED USER → BELONGS TO COUPLE → RESOURCE BELONGS TO SAME COUPLE`
- Love notes with future unlock dates have their content **server-side redacted** from API responses until the unlock time arrives
- No analytics, no third-party trackers, no public social graph
- Passwords are bcrypt-hashed with salt rounds of 10
