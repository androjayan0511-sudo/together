# TogetherMiles — System Architecture

TogetherMiles is a private, production-grade digital space for two people in a long-distance relationship.

---

## 1. Architectural Philosophy

* **Extreme Privacy by Design**: All relationship artifacts belong strictly to a single couple boundary (`couple_id`). Data is never exposed or queryable outside of the couple's verified membership.
* **Layered Separation of Concerns**: Strict pipeline:
  `HTTP Request → Route/Controller → Service Layer → Repository Layer → Database`
* **Real-time Persisted Messaging**: WebSocket broadcasts are coupled with immediate database persistence and state validation.
* **Emotional Integrity**: Time-locks on love notes are enforced at the database and service level, preventing early interception before scheduled dates.

---

## 2. Component Hierarchy

```
togethermiles/
├── backend/
│   ├── app/
│   │   ├── api/             # HTTP route controllers (auth, couples, messages, etc.)
│   │   ├── config/          # Environment configuration & DB bindings
│   │   ├── middleware/      # Auth, couple-scoping & error sanitization
│   │   ├── repositories/    # Pure SQL data access layer
│   │   ├── services/        # Business logic, time-locking, pairing codes
│   │   ├── utils/           # Cryptography, IDs, tokens, uploads
│   │   └── websocket/       # Real-time WebSocket manager
│   ├── uploads/             # Secure storage for memory images
│   └── server.js            # Express & WebSocket server bootstrap
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI primitives, navigation, dialogs
│   │   ├── context/         # AuthContext & session state
│   │   ├── pages/           # Home, Chat, Memories, Together, Settings
│   │   ├── services/        # HTTP client & WebSocket client
│   │   ├── index.css        # Minimalist, warm design tokens & primitives
│   │   └── App.jsx          # Root view container
│
├── database/
│   ├── migrations/          # SQLite relational schema
│   ├── seeds/               # Curated remote couple activities
│   └── db.js                # Database connection & migration runner
│
├── docs/                    # Architecture, API & Database documentation
└── tests/                   # Automated unit & integration test suite
```

---

## 3. Security & Couple Authorization Model

Every private data request passes through two middlewares:
1. `authenticate`: Verifies the Bearer JWT token and resolves `req.user`.
2. `requireCouple`: Resolves the couple space for `req.user.id`, ensuring:
   - The user belongs to the couple.
   - All subsequent queries are strictly parameter-bound to `req.coupleId`.
   - `req.partner` is automatically resolved for contextual alerts.

---

## 4. Real-Time Communication

WebSockets run alongside the HTTP server on `/ws`.
* Clients authenticate during connection via `?token=<jwt>`.
* Sockets are grouped into couple rooms.
* Supported real-time events:
  - `NEW_MESSAGE`: Real-time instant delivery of partner messages.
  - `MESSAGES_READ`: Live read receipts when partner views the chat.
  - `TYPING_START` / `TYPING_STOP`: Live indicator while typing.
  - `PARTNER_CHECK_IN`: Immediate update on home screen when mood changes.
