const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('tm_token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData, default to application/json
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error?.message || 'Something went wrong. Please try again.';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data?.error?.details;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (body) => apiRequest('/auth/me/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  changePassword: (body) => apiRequest('/auth/me/change-password', { method: 'POST', body: JSON.stringify(body) }),

  // Couples
  createCouple: (body) => apiRequest('/couples', { method: 'POST', body: JSON.stringify(body) }),
  joinCouple: (body) => apiRequest('/couples/join', { method: 'POST', body: JSON.stringify(body) }),
  getCouple: () => apiRequest('/couples/me'),
  updateCoupleDate: (body) => apiRequest('/couples/me/date', { method: 'PATCH', body: JSON.stringify(body) }),
  leaveCouple: () => apiRequest('/couples/me/leave', { method: 'POST' }),

  // Home Dashboard
  getHomeSummary: () => apiRequest('/home/summary'),

  // Messages / Chat
  getMessages: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/messages${query ? '?' + query : ''}`);
  },
  sendMessage: (body) => apiRequest('/messages', { method: 'POST', body: JSON.stringify(body) }),
  markMessagesRead: () => apiRequest('/messages/read', { method: 'PATCH' }),
  getUnreadCount: () => apiRequest('/messages/unread-count'),

  // Check-ins
  getCheckIns: () => apiRequest('/checkins'),
  createCheckIn: (body) => apiRequest('/checkins', { method: 'POST', body: JSON.stringify(body) }),
  getCheckInHistory: (limit = 20) => apiRequest(`/checkins/history?limit=${limit}`),

  // Memories
  getMemories: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/memories${query ? '?' + query : ''}`);
  },
  getMemory: (id) => apiRequest(`/memories/${id}`),
  createMemory: (formData) => apiRequest('/memories', { method: 'POST', body: formData }),
  updateMemory: (id, formData) => apiRequest(`/memories/${id}`, { method: 'PATCH', body: formData }),
  deleteMemory: (id) => apiRequest(`/memories/${id}`, { method: 'DELETE' }),

  // Love Notes
  getLoveNotes: () => apiRequest('/love-notes'),
  getLoveNote: (id) => apiRequest(`/love-notes/${id}`),
  createLoveNote: (body) => apiRequest('/love-notes', { method: 'POST', body: JSON.stringify(body) }),
  deleteLoveNote: (id) => apiRequest(`/love-notes/${id}`, { method: 'DELETE' }),

  // Important Dates
  getDates: () => apiRequest('/dates'),
  createDate: (body) => apiRequest('/dates', { method: 'POST', body: JSON.stringify(body) }),
  updateDate: (id, body) => apiRequest(`/dates/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteDate: (id) => apiRequest(`/dates/${id}`, { method: 'DELETE' }),

  // Next Meeting
  getNextMeeting: () => apiRequest('/meetings/next'),
  getMeetings: () => apiRequest('/meetings'),
  createMeeting: (body) => apiRequest('/meetings', { method: 'POST', body: JSON.stringify(body) }),
  updateMeeting: (id, body) => apiRequest(`/meetings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteMeeting: (id) => apiRequest(`/meetings/${id}`, { method: 'DELETE' }),

  // Shared Journal
  getJournalEntries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/journal${query ? '?' + query : ''}`);
  },
  getJournalEntry: (id) => apiRequest(`/journal/${id}`),
  createJournalEntry: (body) => apiRequest('/journal', { method: 'POST', body: JSON.stringify(body) }),
  updateJournalEntry: (id, body) => apiRequest(`/journal/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteJournalEntry: (id) => apiRequest(`/journal/${id}`, { method: 'DELETE' }),

  // Activities
  getActivities: () => apiRequest('/activities'),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/notifications/read-all', { method: 'PATCH' })
};
