import { Global, Module, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'dev.db');

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: () => {
        const db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        return db;
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule implements OnModuleInit {
  constructor() {}

  onModuleInit() {
    const db = new Database(DB_PATH);
    
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        avatarUrl TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
      )
    `);

    db.close();
    console.log('SQLite database initialized');
  }
}
