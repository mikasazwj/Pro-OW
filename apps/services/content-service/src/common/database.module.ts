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
      CREATE TABLE IF NOT EXISTS boards (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT, parentId TEXT, sortOrder INTEGER DEFAULT 0);
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY, boardId TEXT NOT NULL, authorId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
        postType TEXT DEFAULT 'normal', status TEXT DEFAULT 'published', isPinned INTEGER DEFAULT 0, isFeatured INTEGER DEFAULT 0,
        viewCount INTEGER DEFAULT 0, likeCount INTEGER DEFAULT 0, commentCount INTEGER DEFAULT 0, favoriteCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now')), updatedAt TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY, postId TEXT NOT NULL, authorId TEXT NOT NULL, parentId TEXT, replyToId TEXT, replyToAuthorName TEXT,
        content TEXT NOT NULL, status TEXT DEFAULT 'published', likeCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(boardId, createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(authorId);
      CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(postId, createdAt ASC);
      CREATE TABLE IF NOT EXISTS likes (id TEXT PRIMARY KEY, userId TEXT NOT NULL, targetType TEXT NOT NULL, targetId TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), UNIQUE(userId, targetType, targetId));
      CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, userId TEXT NOT NULL, targetType TEXT NOT NULL, targetId TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), UNIQUE(userId, targetType, targetId));
      CREATE TABLE IF NOT EXISTS follows (id TEXT PRIMARY KEY, followerId TEXT NOT NULL, followingId TEXT NOT NULL, createdAt TEXT DEFAULT (datetime('now')), UNIQUE(followerId, followingId));
      CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, userId TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL, sourceType TEXT, sourceId TEXT, isRead INTEGER DEFAULT 0, createdAt TEXT DEFAULT (datetime('now')));
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId, isRead, createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(userId, createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(followerId);
      CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(followingId);
    `);
    // Migrations
    try { db.exec("ALTER TABLE users ADD COLUMN nickname TEXT"); } catch {}
    try { db.exec("ALTER TABLE posts ADD COLUMN favoriteCount INTEGER DEFAULT 0"); } catch {}
    try { db.exec("ALTER TABLE comments ADD COLUMN replyToId TEXT"); } catch {}
    try { db.exec("ALTER TABLE comments ADD COLUMN replyToAuthorName TEXT"); } catch {}
    // FTS5 for search
    try { db.exec("CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(title, content, content='posts', content_rowid='rowid')"); } catch {}
    // Triggers to keep FTS in sync
    try { db.exec("CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN INSERT INTO posts_fts(rowid, title, content) VALUES (new.rowid, new.title, new.content); END;"); } catch {}
    try { db.exec("CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN INSERT INTO posts_fts(posts_fts, rowid, title, content) VALUES('delete', old.rowid, old.title, old.content); END;"); } catch {}
    
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