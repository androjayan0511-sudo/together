# TogetherMiles — REST API Reference

All requests accept and return JSON. Authenticated requests require the header:
`Authorization: Bearer <token>`

---

## 1. Authentication

### `POST /api/auth/register`
Create a new user account.
```json
{
  "name": "Andro",
  "email": "andro@togethermiles.com",
  "password": "password123",
  "timezone": "UTC"
}
```

### `POST /api/auth/login`
Authenticate with email and password.
```json
{
  "email": "andro@togethermiles.com",
  "password": "password123"
}
```

### `GET /api/auth/me`
Retrieve currently authenticated profile and couple status.

### `PATCH /api/auth/me/profile`
Update user name, avatar, or timezone.

### `POST /api/auth/me/change-password`
Update user password with current password confirmation.

---

## 2. Couple Space Management

### `POST /api/couples`
Create a new couple space and generate a unique pairing code.
```json
{
  "relationshipStartDate": "2024-02-14"
}
```

### `POST /api/couples/join`
Join a partner's couple space with their pairing code.
```json
{
  "pairingCode": "TM-8X2-9KP"
}
```

### `GET /api/couples/me`
Retrieve active couple metadata, partner details, and days together.

### `PATCH /api/couples/me/date`
Update relationship start date.

### `POST /api/couples/me/leave`
Disconnect from the couple space.

---

## 3. Home Dashboard Aggregate

### `GET /api/home/summary`
Returns instant unified state for Home view:
* Couple & partner info
* Today's check-ins (both partners)
* Next meeting countdown
* Upcoming important date
* Recent memory showcase
* Unread message count

---

## 4. Chat & Messages

### `GET /api/messages?limit=50&before=<iso_timestamp>`
Retrieve message history chronologically.

### `POST /api/messages`
Send message to partner and broadcast via WebSocket.
```json
{
  "content": "Good morning my love!",
  "messageType": "text"
}
```

### `PATCH /api/messages/read`
Mark partner's unread messages as read.

---

## 5. Daily Check-in

### `GET /api/checkins`
Get the latest check-in for each partner in the couple.

### `POST /api/checkins`
Submit today's emotional state.
```json
{
  "mood": "Missing you",
  "note": "Thinking about our weekend walks."
}
```
*Valid moods*: `Happy`, `Missing you`, `Tired`, `Busy`, `Sad`, `Need some time`, `Want to talk`.

---

## 6. Shared Memories

### `GET /api/memories?limit=50&offset=0`
List memories ordered chronologically by memory date.

### `POST /api/memories` (Multipart Form / JSON)
Create a memory with optional photo upload.
* Form fields: `title`, `description`, `memoryDate`, `location`, `image` (file).

### `GET /api/memories/:id`
View memory details.

### `PATCH /api/memories/:id`
Edit memory.

### `DELETE /api/memories/:id`
Delete memory.

---

## 7. Love Notes

### `GET /api/love-notes`
List notes. Notes where `unlock_at` is in the future for the recipient have their content strictly redacted (`null`).

### `POST /api/love-notes`
Send a private sealed love note with optional future unlock date.
```json
{
  "title": "Open on our anniversary",
  "content": "My dear...",
  "unlockAt": "2026-10-14T00:00:00.000Z"
}
```

### `GET /api/love-notes/:id`
Read note. Returns 403 Forbidden if locked before `unlock_at`.

---

## 8. Important Dates & Countdown

### `GET /api/dates`
List recurring milestones (Anniversary, Birthday, First met) with `days_until` computation.

### `POST /api/dates`
```json
{
  "title": "First Meeting",
  "date": "2023-04-12",
  "type": "first_met"
}
```

---

## 9. Next Meeting

### `GET /api/meetings/next`
Retrieve the closest upcoming reunion date and live countdown target.

### `POST /api/meetings`
```json
{
  "title": "Autumn Reunion",
  "meetingAt": "2026-10-14T18:00:00.000Z",
  "location": "Airport Terminal 3",
  "note": "Can't wait to see your smile."
}
```

---

## 10. Shared Journal

### `GET /api/journal`
Chronological reflections from both partners.

### `POST /api/journal`
Create entry.
```json
{
  "title": "Thoughts on Distance",
  "content": "Every mile is just temporary..."
}
```

---

## 11. Curated Activities

### `GET /api/activities`
Returns curated lightweight remote activities:
* Synchronized Movie Night
* Question of the Heart
* Candlelit Virtual Dinner
* Window to My World
* Two Truths & A Secret Wish
