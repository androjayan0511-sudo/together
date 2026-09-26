import test from 'node:test';
import assert from 'node:assert/strict';
import { resetDatabaseForTest } from '../database/db.js';
import { authService } from '../backend/app/services/authService.js';
import { coupleService } from '../backend/app/services/coupleService.js';
import { chatService } from '../backend/app/services/chatService.js';
import { checkInService } from '../backend/app/services/checkInService.js';
import { memoryService } from '../backend/app/services/memoryService.js';
import { loveNoteService } from '../backend/app/services/loveNoteService.js';
import { importantDateService } from '../backend/app/services/importantDateService.js';
import { meetingService } from '../backend/app/services/meetingService.js';
import { journalService } from '../backend/app/services/journalService.js';

test.beforeEach(() => {
  resetDatabaseForTest();
});

test('AUTHENTICATION: Registration, Login, Invalid Credentials', async (t) => {
  // 1. Register User A
  const resA = await authService.register({
    name: 'Andro',
    email: 'andro@example.com',
    password: 'securepassword123'
  });
  assert.equal(resA.user.name, 'Andro');
  assert.equal(resA.user.email, 'andro@example.com');
  assert.ok(resA.token);

  // 2. Prevent duplicate email registration
  await assert.rejects(
    async () => {
      await authService.register({
        name: 'Andro Duplicate',
        email: 'andro@example.com',
        password: 'securepassword123'
      });
    },
    { name: 'ConflictError' }
  );

  // 3. Login with valid credentials
  const loginRes = await authService.login({
    email: 'andro@example.com',
    password: 'securepassword123'
  });
  assert.equal(loginRes.user.id, resA.user.id);
  assert.ok(loginRes.token);

  // 4. Login with invalid password
  await assert.rejects(
    async () => {
      await authService.login({
        email: 'andro@example.com',
        password: 'wrongpassword'
      });
    },
    { name: 'UnauthorizedError' }
  );
});

test('COUPLE: Create couple, Join with pairing code, Prevent multiple couples', async (t) => {
  // Register User A & User B
  const userA = await authService.register({
    name: 'User A',
    email: 'usera@example.com',
    password: 'password123'
  });
  const userB = await authService.register({
    name: 'User B',
    email: 'userb@example.com',
    password: 'password123'
  });

  // User A creates couple space
  const couple = await coupleService.createCouple(userA.user.id, {
    relationshipStartDate: '2024-02-14'
  });
  assert.ok(couple.id);
  assert.ok(couple.pairing_code);
  assert.equal(couple.user_one_id, userA.user.id);
  assert.equal(couple.user_two_id, null);

  // User A cannot join their own space
  await assert.rejects(
    async () => {
      await coupleService.joinCouple(userA.user.id, couple.pairing_code);
    },
    { name: 'ValidationError' }
  );

  // User B joins with invalid code
  await assert.rejects(
    async () => {
      await coupleService.joinCouple(userB.user.id, 'INVALID-CODE-99');
    },
    { name: 'NotFoundError' }
  );

  // User B joins with valid code
  const pairedCouple = await coupleService.joinCouple(userB.user.id, couple.pairing_code);
  assert.equal(pairedCouple.user_two_id, userB.user.id);

  // Third user cannot join an already full couple space
  const userC = await authService.register({
    name: 'User C',
    email: 'userc@example.com',
    password: 'password123'
  });
  await assert.rejects(
    async () => {
      await coupleService.joinCouple(userC.user.id, couple.pairing_code);
    },
    { name: 'ConflictError' }
  );

  // User A or B cannot create another couple while already paired
  await assert.rejects(
    async () => {
      await coupleService.createCouple(userA.user.id);
    },
    { name: 'ConflictError' }
  );
});

test('CHAT: Send message, Retrieve messages, Read status', async (t) => {
  const userA = await authService.register({ name: 'A', email: 'a@example.com', password: 'password123' });
  const userB = await authService.register({ name: 'B', email: 'b@example.com', password: 'password123' });
  const couple = await coupleService.createCouple(userA.user.id);
  await coupleService.joinCouple(userB.user.id, couple.pairing_code);

  // User A sends message
  const msg1 = await chatService.sendMessage(couple.id, userA.user.id, { content: 'Good morning my love!' });
  assert.equal(msg1.content, 'Good morning my love!');
  assert.equal(msg1.sender_id, userA.user.id);
  assert.equal(msg1.read_at, null);

  // User B sends response
  const msg2 = await chatService.sendMessage(couple.id, userB.user.id, { content: 'Morning! Missing you today.' });
  assert.equal(msg2.content, 'Morning! Missing you today.');

  // Retrieve message history
  const history = await chatService.getMessages(couple.id);
  assert.equal(history.length, 2);

  // Unread count for User B (User A's message)
  const unreadForB = await chatService.getUnreadCount(couple.id, userB.user.id);
  assert.equal(unreadForB, 1);

  // User B marks as read
  const readRes = await chatService.markAsRead(couple.id, userB.user.id);
  assert.equal(readRes.readCount, 1);

  // Unread count now 0
  const unreadAfter = await chatService.getUnreadCount(couple.id, userB.user.id);
  assert.equal(unreadAfter, 0);
});

test('DAILY CHECK-IN: Valid states, Partner visibility, History', async (t) => {
  const userA = await authService.register({ name: 'A', email: 'a@example.com', password: 'password123' });
  const userB = await authService.register({ name: 'B', email: 'b@example.com', password: 'password123' });
  const couple = await coupleService.createCouple(userA.user.id);
  await coupleService.joinCouple(userB.user.id, couple.pairing_code);

  // User A submits check-in
  const checkA = await checkInService.createCheckIn(couple.id, userA.user.id, {
    mood: 'Missing you',
    note: 'Thinking about our weekend walks.'
  }, userB.user.id);
  assert.equal(checkA.mood, 'Missing you');

  // Invalid mood validation
  await assert.rejects(
    async () => {
      await checkInService.createCheckIn(couple.id, userA.user.id, { mood: 'EcstaticSuperHero' });
    },
    { name: 'ValidationError' }
  );

  // User B submits check-in
  await checkInService.createCheckIn(couple.id, userB.user.id, { mood: 'Busy' });

  // Get latest for couple
  const latest = await checkInService.getLatestForCouple(couple.id);
  assert.equal(latest.length, 2);
});

test('MEMORIES: Create, Retrieve, Update, Delete with Couple boundary', async (t) => {
  const userA = await authService.register({ name: 'A', email: 'a@example.com', password: 'password123' });
  const userB = await authService.register({ name: 'B', email: 'b@example.com', password: 'password123' });
  const couple = await coupleService.createCouple(userA.user.id);
  await coupleService.joinCouple(userB.user.id, couple.pairing_code);

  // Another couple
  const userC = await authService.register({ name: 'C', email: 'c@example.com', password: 'password123' });
  const coupleOther = await coupleService.createCouple(userC.user.id);

  // User A creates memory
  const memory = await memoryService.createMemory(couple.id, userA.user.id, {
    title: 'Our first trip to the coast',
    description: 'We watched the sunset and talked until 2am.',
    memoryDate: '2024-05-10',
    location: 'Monterey'
  });
  assert.ok(memory.id);
  assert.equal(memory.title, 'Our first trip to the coast');

  // Retrieve memories
  const list = await memoryService.getMemories(couple.id);
  assert.equal(list.length, 1);

  // Unauthorized couple cannot access memory
  await assert.rejects(
    async () => {
      await memoryService.getMemoryById(coupleOther.id, memory.id);
    },
    { name: 'NotFoundError' }
  );

  // Update memory
  const updated = await memoryService.updateMemory(couple.id, memory.id, userA.user.id, {
    title: 'Our coastal sunset'
  });
  assert.equal(updated.title, 'Our coastal sunset');

  // Delete memory
  await memoryService.deleteMemory(couple.id, memory.id, userA.user.id);
  const remaining = await memoryService.getMemories(couple.id);
  assert.equal(remaining.length, 0);
});

test('LOVE NOTES: Strict unlock date protection and recipient opening', async (t) => {
  const userA = await authService.register({ name: 'A', email: 'a@example.com', password: 'password123' });
  const userB = await authService.register({ name: 'B', email: 'b@example.com', password: 'password123' });
  const couple = await coupleService.createCouple(userA.user.id);
  await coupleService.joinCouple(userB.user.id, couple.pairing_code);

  // 1. Create a future locked note (unlocks in 7 days)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const lockedNote = await loveNoteService.createNote(
    couple.id,
    userA.user.id,
    userB.user.id,
    {
      title: 'Open when you need strength',
      content: 'This is my deeply confidential secret message.',
      unlockAt: futureDate.toISOString()
    }
  );

  // 2. Sender can view the note and content
  const senderViewList = await loveNoteService.getNotes(couple.id, userA.user.id);
  assert.equal(senderViewList[0].content, 'This is my deeply confidential secret message.');
  assert.equal(senderViewList[0].is_locked, false);

  // 3. Recipient views the notes list: CONTENT MUST BE REDACTED (null)
  const recipientViewList = await loveNoteService.getNotes(couple.id, userB.user.id);
  assert.equal(recipientViewList[0].content, null);
  assert.equal(recipientViewList[0].is_locked, true);

  // 4. Recipient cannot open note before unlock date
  await assert.rejects(
    async () => {
      await loveNoteService.getNoteById(couple.id, lockedNote.id, userB.user.id);
    },
    { name: 'ForbiddenError' }
  );

  // 5. Create an already unlocked note (unlock date in the past)
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);

  const unlockedNote = await loveNoteService.createNote(
    couple.id,
    userA.user.id,
    userB.user.id,
    {
      title: 'Just a reminder',
      content: 'You are capable of amazing things.',
      unlockAt: pastDate.toISOString()
    }
  );

  // Recipient CAN read and content is visible
  const unlockedView = await loveNoteService.getNoteById(couple.id, unlockedNote.id, userB.user.id);
  assert.equal(unlockedView.content, 'You are capable of amazing things.');
  assert.ok(unlockedView.opened_at);
});

test('DATES & MEETINGS: Important dates & Next meeting countdown', async (t) => {
  const userA = await authService.register({ name: 'A', email: 'a@example.com', password: 'password123' });
  const userB = await authService.register({ name: 'B', email: 'b@example.com', password: 'password123' });
  const couple = await coupleService.createCouple(userA.user.id);
  await coupleService.joinCouple(userB.user.id, couple.pairing_code);

  // Add anniversary
  const anniv = await importantDateService.createDate(couple.id, {
    title: 'Anniversary',
    date: '2023-10-14',
    type: 'anniversary'
  });
  assert.ok(anniv.id);

  const dates = await importantDateService.getDates(couple.id);
  assert.equal(dates.length, 1);
  assert.ok(dates[0].days_until >= 0);

  // Next meeting in 14 days
  const meetingDate = new Date();
  meetingDate.setDate(meetingDate.getDate() + 14);

  const meeting = await meetingService.createMeeting(couple.id, {
    title: 'Airport Reunion',
    meetingAt: meetingDate.toISOString(),
    location: 'Terminal 2',
    note: 'Bring warm coats!'
  });
  assert.equal(meeting.title, 'Airport Reunion');

  const nextMeeting = await meetingService.getNextMeeting(couple.id);
  assert.equal(nextMeeting.id, meeting.id);
});

test('JOURNAL: Shared journaling and author permissions', async (t) => {
  const userA = await authService.register({ name: 'A', email: 'a@example.com', password: 'password123' });
  const userB = await authService.register({ name: 'B', email: 'b@example.com', password: 'password123' });
  const couple = await coupleService.createCouple(userA.user.id);
  await coupleService.joinCouple(userB.user.id, couple.pairing_code);

  const entry = await journalService.createEntry(couple.id, userA.user.id, {
    title: 'Reflections from afar',
    content: 'Distance teaches us that true connection is independent of geography.'
  });
  assert.ok(entry.id);

  // Partner User B can read entry
  const retrieved = await journalService.getEntryById(couple.id, entry.id);
  assert.equal(retrieved.title, 'Reflections from afar');

  // Partner User B cannot edit User A's entry
  await assert.rejects(
    async () => {
      await journalService.updateEntry(couple.id, entry.id, userB.user.id, { title: 'Hacked title' });
    },
    { name: 'ForbiddenError' }
  );

  // Author User A can edit
  const updated = await journalService.updateEntry(couple.id, entry.id, userA.user.id, {
    title: 'Reflections on our journey'
  });
  assert.equal(updated.title, 'Reflections on our journey');
});
