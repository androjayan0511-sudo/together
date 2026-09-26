import { loveNoteRepository } from '../repositories/loveNoteRepository.js';
import { notificationRepository } from '../repositories/notificationRepository.js';
import { generateId } from '../utils/crypto.js';
import { ValidationError, NotFoundError, ForbiddenError } from '../utils/errors.js';

export const loveNoteService = {
  async createNote(coupleId, senderId, recipientId, { title, content, unlockAt = null }) {
    if (!title || title.trim().length === 0) {
      throw new ValidationError('Note title is required');
    }
    if (!content || content.trim().length === 0) {
      throw new ValidationError('Note content is required');
    }

    // Validate unlock date if provided
    let cleanUnlockAt = null;
    if (unlockAt) {
      const unlockDate = new Date(unlockAt);
      if (isNaN(unlockDate.getTime())) {
        throw new ValidationError('Invalid unlock date format');
      }
      cleanUnlockAt = unlockDate.toISOString();
    }

    const id = generateId('not');
    const now = new Date().toISOString();

    const note = loveNoteRepository.create({
      id,
      coupleId,
      senderId,
      recipientId,
      title: title.trim(),
      content: content.trim(),
      unlockAt: cleanUnlockAt,
      createdAt: now
    });

    // Notify recipient that a note was left for them
    if (recipientId) {
      const isLocked = cleanUnlockAt && new Date(cleanUnlockAt) > new Date();
      notificationRepository.create({
        id: generateId('ntf'),
        userId: recipientId,
        type: 'love_note',
        title: 'New Love Note',
        body: isLocked
          ? `Your partner wrote a note locked until ${new Date(cleanUnlockAt).toLocaleDateString()}`
          : 'Your partner left you a new love note',
        createdAt: now
      });
    }

    return note;
  },

  async getNotes(coupleId, currentUserId) {
    const rawNotes = loveNoteRepository.findByCoupleId(coupleId);
    const now = new Date();

    return rawNotes.map((note) => {
      const isSender = note.sender_id === currentUserId;
      const hasUnlock = !!note.unlock_at;
      const isFuture = hasUnlock && new Date(note.unlock_at) > now;
      const isLocked = !isSender && isFuture;

      return {
        id: note.id,
        couple_id: note.couple_id,
        sender_id: note.sender_id,
        recipient_id: note.recipient_id,
        sender_name: note.sender_name,
        sender_avatar: note.sender_avatar,
        title: note.title,
        // Crucial security guarantee: redact content if recipient and note is locked
        content: isLocked ? null : note.content,
        unlock_at: note.unlock_at,
        opened_at: note.opened_at,
        created_at: note.created_at,
        is_locked: isLocked,
        is_sender: isSender
      };
    });
  },

  async getNoteById(coupleId, noteId, currentUserId) {
    const note = loveNoteRepository.findById(noteId, coupleId);
    if (!note) {
      throw new NotFoundError('Love note not found');
    }

    const isSender = note.sender_id === currentUserId;
    const now = new Date();
    const hasUnlock = !!note.unlock_at;
    const isFuture = hasUnlock && new Date(note.unlock_at) > now;
    const isLocked = !isSender && isFuture;

    if (isLocked) {
      throw new ForbiddenError(`This note is sealed and waiting for you. It unlocks on ${new Date(note.unlock_at).toLocaleDateString()}`);
    }

    // If recipient is viewing for the first time, mark as opened
    if (!isSender && !note.opened_at) {
      return loveNoteRepository.markOpened(noteId, coupleId, now.toISOString());
    }

    return {
      ...note,
      is_locked: false,
      is_sender: isSender
    };
  },

  async deleteNote(coupleId, noteId, currentUserId) {
    const deleted = loveNoteRepository.delete(noteId, coupleId, currentUserId);
    if (!deleted) {
      throw new NotFoundError('Note not found or you are not authorized to delete it');
    }
    return true;
  }
};
