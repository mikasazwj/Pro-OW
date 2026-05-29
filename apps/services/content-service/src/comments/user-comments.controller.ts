import { Controller, Get, Query, Inject } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import Database from 'better-sqlite3';
import type { ApiResponse } from '@pro-ow/shared';

class UserCommentsQuery {
  @IsString() authorId!: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

@Controller('comments')
export class UserCommentsController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  getUserComments(@Query() query: UserCommentsQuery): ApiResponse {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 50);
    const offset = (page - 1) * pageSize;

    const items = this.db.prepare(
      "SELECT c.id, c.content, c.postId, c.likeCount, c.createdAt, COALESCE(u.nickname, u.username) as authorName FROM comments c LEFT JOIN users u ON c.authorId = u.id WHERE c.authorId = ? AND c.status = ? ORDER BY c.createdAt DESC LIMIT ? OFFSET ?"
    ).all(query.authorId, 'published', pageSize, offset);

    const { total } = this.db.prepare(
      'SELECT COUNT(*) as total FROM comments WHERE authorId = ? AND status = ?'
    ).get(query.authorId, 'published') as { total: number };

    return { code: 0, message: 'ok', data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }
}