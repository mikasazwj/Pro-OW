import { Controller, Get, Post, Delete, Body, Param, Query, Inject, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, MinLength } from 'class-validator';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { filterContent, checkRateLimit } from '../common/content-filter';
import type { ApiResponse } from '@pro-ow/shared';

class CreateCommentDto {
  @IsString() @MinLength(1) content!: string;
  @IsOptional() @IsString() parentId?: string;
  @IsOptional() @IsString() replyToId?: string;
  @IsOptional() @IsString() replyToAuthorName?: string;
}
class ListCommentsQuery {
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  getComments(@Param('postId') postId: string, @Query() query: ListCommentsQuery): ApiResponse {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 50, 100);
    const offset = (page - 1) * pageSize;
    const items = this.db.prepare("SELECT c.id, c.content, c.parentId, c.authorId, c.replyToId, c.replyToAuthorName, c.likeCount, c.createdAt, COALESCE(u.nickname, u.username) as authorName FROM comments c LEFT JOIN users u ON c.authorId = u.id WHERE c.postId = ? AND c.status = ? ORDER BY c.createdAt ASC LIMIT ? OFFSET ?").all(postId, 'published', pageSize, offset);
    const { total } = this.db.prepare('SELECT COUNT(*) as total FROM comments WHERE postId = ? AND status = ?').get(postId, 'published') as { total: number };
    return { code: 0, message: 'ok', data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createComment(@Param('postId') postId: string, @Body() dto: CreateCommentDto, @Req() req: { user: { userId: string; username: string; nickname: string | null } }): ApiResponse {
    if (!checkRateLimit(req.user.userId, 'createComment', 5, 60000)) return { code: 42900, message: '评论太频繁，请稍后再试', data: null };
    const post = this.db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) return { code: 40400, message: '帖子不存在', data: null };

    const { filtered } = filterContent(dto.content);
    const { userId, username, nickname } = req.user;
    this.db.prepare('INSERT OR REPLACE INTO users (id, username, nickname) VALUES (?, ?, ?)').run(userId, username, nickname);

    const id = uuidv4();
    this.db.prepare('INSERT INTO comments (id, postId, authorId, parentId, replyToId, replyToAuthorName, content) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, postId, userId, dto.parentId || null, dto.replyToId || null, dto.replyToAuthorName || null, filtered);
    this.db.prepare('UPDATE posts SET commentCount = commentCount + 1 WHERE id = ?').run(postId);

    const postAuthor = this.db.prepare('SELECT authorId, title FROM posts WHERE id = ?').get(postId) as { authorId: string; title: string } | undefined;
    const authorName = nickname || username;
    if (postAuthor && postAuthor.authorId !== userId) {
      this.db.prepare('INSERT INTO notifications (id, userId, title, content, sourceType, sourceId) VALUES (?, ?, ?, ?, ?, ?)').run(uuidv4(), postAuthor.authorId, '新回复', authorName + ' 回复了你的帖子', 'post', postId);
    }
    return { code: 0, message: '评论成功', data: { id, content: filtered, parentId: dto.parentId, replyToId: dto.replyToId, replyToAuthorName: dto.replyToAuthorName, authorName, createdAt: new Date().toISOString() } };
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(@Param('postId') postId: string, @Param('commentId') commentId: string, @Req() req: { user: { userId: string; role: string } }): ApiResponse {
    const comment = this.db.prepare('SELECT authorId FROM comments WHERE id = ? AND postId = ?').get(commentId, postId) as { authorId: string } | undefined;
    if (!comment) return { code: 40400, message: '评论不存在', data: null };
    if (req.user.role !== 'admin' && comment.authorId !== req.user.userId) return { code: 40300, message: '无权限删除此评论', data: null };
    this.db.prepare("UPDATE comments SET status = 'deleted' WHERE id = ?").run(commentId);
    this.db.prepare('UPDATE posts SET commentCount = MAX(0, commentCount - 1) WHERE id = ?').run(postId);
    return { code: 0, message: '删除成功', data: null };
  }
}