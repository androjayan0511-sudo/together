-- Seed thoughtful remote couple activities
INSERT OR IGNORE INTO activities (id, title, description, category, created_at) VALUES
('act-1', 'Synchronized Movie Night', 'Pick a film, make your favorite tea or snack, jump on audio, and press play at the exact same second.', 'watch', datetime('now')),
('act-2', 'Question of the Heart', 'Take turns answering: "What is a small memory of us that made you smile this past week?"', 'questions', datetime('now')),
('act-3', 'Candlelit Virtual Dinner', 'Cook the same recipe or order the same comfort cuisine, set the phone by the plate, and enjoy dinner together.', 'dinner', datetime('now')),
('act-4', 'Window to My World', 'Send an unfiltered photo of your view right now: your desk, the sky, or your morning cup.', 'photo', datetime('now')),
('act-5', 'Two Truths & A Secret Wish', 'Share two things about your day that actually happened, and one thing you wish happened with them.', 'game', datetime('now')),
('act-6', 'Deep Listening Session', 'Put on a shared playlist in silence for 15 minutes, listening to the exact same tracks at the same time.', 'watch', datetime('now')),
('act-7', 'Dreaming Our Next Trip', 'Find one place neither of you has ever been and plan an imaginary itinerary for a weekend there.', 'questions', datetime('now'));
