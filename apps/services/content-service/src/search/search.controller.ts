import { Controller, Get, Query, Inject } from '@nestjs/common';
import { IsString } from 'class-validator';
import Database from 'better-sqlite3';
import type { ApiResponse } from '@pro-ow/shared';

class SearchQuery {
  @IsString() q!: string;
}

@Controller('search')
export class SearchController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  search(@Query() query: SearchQuery): ApiResponse {
    const q = query.q.trim();
    if (!q) return { code: 0, message: 'ok', data: { items: [], total: 0 } };

    // Try FTS5 first, fall back to LIKE
    let items: unknown[];
    try {
      items = this.db.prepare(
        "SELECT p.id, p.title, substr(p.content,1,200) as summary, p.likeCount, p.commentCount, p.createdAt, b.name as boardName, COALESCE(u.nickname,u.username) as authorName FROM posts_fts fts JOIN posts p ON fts.rowid = p.rowid LEFT JOIN boards b ON p.boardId = b.id LEFT JOIN users u ON p.authorId = u.id WHERE posts_fts MATCH ? AND p.status = 'published' ORDER BY rank LIMIT 30"
      ).all(q);
    } catch {
      const likeQ = '%' + q + '%';
      items = this.db.prepare(
        "SELECT p.id, p.title, substr(p.content,1,200) as summary, p.likeCount, p.commentCount, p.createdAt, b.name as boardName, COALESCE(u.nickname,u.username) as authorName FROM posts p LEFT JOIN boards b ON p.boardId = b.id LEFT JOIN users u ON p.authorId = u.id WHERE p.status = 'published' AND (p.title LIKE ? OR p.content LIKE ?) ORDER BY p.createdAt DESC LIMIT 30"
      ).all(likeQ, likeQ);
    }

    return { code: 0, message: 'ok', data: { items, total: (items as unknown[]).length } };
  }
}