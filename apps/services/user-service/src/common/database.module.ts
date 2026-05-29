import { Global, Module, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'dev.db');

@Global()
@Module({
  providers: [{ provide: 'DATABASE', useFactory: () => { const db = new Database(DB_PATH); db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); return db; } }],
  exports: ['DATABASE'],
})
export class DatabaseModule implements OnModuleInit {
  onModuleInit() {
    const db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL, avatarUrl TEXT, nickname TEXT, bio TEXT,
        role TEXT DEFAULT 'user', status TEXT DEFAULT 'active', isEmailVerified INTEGER DEFAULT 0,
        mutedUntil TEXT, createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY, userId TEXT NOT NULL, token TEXT UNIQUE NOT NULL,
        expiresAt TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS verification_codes (
        id TEXT PRIMARY KEY, userId TEXT NOT NULL, code TEXT NOT NULL,
        expiresAt TEXT NOT NULL, used INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now'))
      );
    `);
    try { db.exec('ALTER TABLE users ADD COLUMN nickname TEXT'); } catch {}
    try { db.exec('ALTER TABLE users ADD COLUMN bio TEXT'); } catch {}
    try { db.exec('ALTER TABLE users ADD COLUMN isEmailVerified INTEGER DEFAULT 0'); } catch {}
    try { db.exec('ALTER TABLE users ADD COLUMN mutedUntil TEXT'); } catch {}
    db.close();
    console.log('SQLite database initialized');
  }
}