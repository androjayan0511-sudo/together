import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../backend/app/config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export function getDatabase(dbFilePath = config.dbPath) {
  if (dbInstance) {
    return dbInstance;
  }

  if (dbFilePath !== ':memory:') {
    const dir = path.dirname(dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  dbInstance = new DatabaseSync(dbFilePath);
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  
  if (dbFilePath !== ':memory:') {
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA synchronous = NORMAL;');
  }

  const migrationPath = path.resolve(__dirname, 'migrations/001_initial_schema.sql');
  if (fs.existsSync(migrationPath)) {
    dbInstance.exec(fs.readFileSync(migrationPath, 'utf8'));
  }

  const seedPath = path.resolve(__dirname, 'seeds/001_seed_activities.sql');
  if (fs.existsSync(seedPath)) {
    dbInstance.exec(fs.readFileSync(seedPath, 'utf8'));
  }

  return dbInstance;
}

export function resetDatabaseForTest() {
  const instance = getDatabase();
  instance.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM notifications;
    DELETE FROM activities;
    DELETE FROM journal_entries;
    DELETE FROM meetings;
    DELETE FROM important_dates;
    DELETE FROM love_notes;
    DELETE FROM memories;
    DELETE FROM check_ins;
    DELETE FROM messages;
    DELETE FROM couples;
    DELETE FROM users;
    PRAGMA foreign_keys = ON;
  `);

  const seedPath = path.resolve(__dirname, 'seeds/001_seed_activities.sql');
  if (fs.existsSync(seedPath)) {
    instance.exec(fs.readFileSync(seedPath, 'utf8'));
  }
  return instance;
}

// Transparent proxy so imported `db` is always bound to active dbInstance
export const db = new Proxy({}, {
  get(target, prop) {
    const instance = getDatabase();
    const val = instance[prop];
    if (typeof val === 'function') {
      return val.bind(instance);
    }
    return val;
  }
});

export default db;
