import { Global, Module, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'content.db');

@Global()
@Module({
  providers: [{ provide: 'DATABASE', useFactory: () => { const db = new Database(DB_PATH); db.pragma('journal_mode = WAL'); db.pragma('foreign_keys = ON'); return db; } }],
  exports: ['DATABASE'],
})
export class DatabaseModule implements OnModuleInit {
  onModuleInit() {
    const db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL, nickname TEXT, createdAt TEXT DEFAULT (datetime('now')));
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, parentId TEXT, sortOrder INTEGER DEFAULT 0
      );
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY, boardId TEXT NOT NULL, authorId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
        postType TEXT DEFAULT 'normal', status TEXT DEFAULT 'published', isPinned INTEGER DEFAULT 0, isFeatured INTEGER DEFAULT 0,
        viewCount INTEGER DEFAULT 0, likeCount INTEGER DEFAULT 0, commentCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY, postId TEXT NOT NULL, authorId TEXT NOT NULL, parentId TEXT, replyToId TEXT,
        content TEXT NOT NULL, status TEXT DEFAULT 'published', likeCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(boardId, createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(authorId);
            CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(postId, createdAt ASC);
      CREATE TABLE IF NOT EXISTS likes (id TEXT PRIMARY KEY, userId TEXT NOT NULL, targetType TEXT NOT NULL, targetId TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), UNIQUE(userId, targetType, targetId));
      CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, sourceType TEXT, sourceId TEXT, isRead INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now')));
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId, isRead, createdAt DESC);
    `);
    // Add nickname column if missing
    try { db.exec("ALTER TABLE users ADD COLUMN nickname TEXT"); } catch {}
    
    const count = db.prepare('SELECT COUNT(*) as cnt FROM boards').get() as { cnt: number };
    if (count.cnt === 0) {
      const insert = db.prepare('INSERT INTO boards (id, name, slug, description, sortOrder) VALUES (?, ?, ?, ?, ?)');
      insert.run('b1', '综合讨论', 'general', '守望先锋综合话题讨论区', 1);
      insert.run('b2', '英雄攻略', 'hero-guides', '各英雄玩法、连招、阵容搭配攻略', 2);
      insert.run('b3', '赛事资讯', 'esports', 'OWL、世界杯等赛事资讯与讨论', 3);
      insert.run('b4', '组队开黑', 'lfg', '寻找队友、车队招募、开黑约战', 4);
      insert.run('b5', '创意工坊', 'workshop', '自定义模式代码分享与讨论', 5);
      insert.run('b6', '灌水区', 'off-topic', '休闲聊天，随意灌水', 6);
    }
    db.close();
    console.log('Content database initialized');
  }
}