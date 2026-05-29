import { Controller, Get, Post, Body, Param, Query, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { IsString, IsOptional, MinLength, IsIn } from 'class-validator';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { ApiResponse } from '@pro-ow/shared';

class CreateCommentDto {
  @IsString() @MinLength(1) content!: string;
  @IsOptional() @IsString() parentId?: string;
}

class ListCommentsQuery {
  @IsOptional() @IsIn(['latest', 'hot']) sort?: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  getComments(@Param('postId') postId: string, @Query() query: ListCommentsQuery): ApiResponse {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 50);
    const offset = (page - 1) * pageSize;
    const orderBy = query.sort === 'hot' ? 'c.likeCount DESC' : 'c.createdAt ASC';

    const items = this.db.prepare(
      'SELECT c.id, c.content, c.parentId, c.likeCount, c.createdAt FROM comments c WHERE c.postId = ? AND c.status = ? ORDER BY ' + orderBy + ' LIMIT ? OFFSET ?'
    ).all(postId, 'published', pageSize, offset);

    const { total } = this.db.prepare('SELECT COUNT(*) as total FROM comments WHERE postId = ? AND status = ?').get(postId, 'published') as { total: number };

    return { code: 0, message: 'ok', data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createComment(@Param('postId') postId: string, @Body() dto: CreateCommentDto): ApiResponse {
    const post = this.db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) return { code: 40400, message: '帖子不存在', data: null };

    const id = uuidv4();
    const authorId = '00000000-0000-0000-0000-000000000001';
    this.db.prepare(
      'INSERT INTO comments (id, postId, authorId, parentId, content) VALUES (?, ?, ?, ?, ?)'
    ).run(id, postId, authorId, dto.parentId || null, dto.content);

    this.db.prepare('UPDATE posts SET commentCount = commentCount + 1 WHERE id = ?').run(postId);

    return { code: 0, message: '评论成功', data: { id } };
  }
}
