import { Controller, Get, Post, Body, Param, Query, Inject, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ApiResponse } from '@pro-ow/shared';

class CreatePostDto {
  @IsString() boardId!: string;
  @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @IsString() @MinLength(10) content!: string;
}

class ListPostsQuery {
  @IsOptional() @IsString() boardId?: string;
  @IsOptional() @IsIn(['latest', 'hot', 'featured']) sort?: string;
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

@Controller('posts')
export class PostsController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  getPosts(@Query() query: ListPostsQuery): ApiResponse {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 50);
    const offset = (page - 1) * pageSize;

    let where = "WHERE p.status = 'published'";
    const params: unknown[] = [];
    if (query.boardId) { where += ' AND p.boardId = ?'; params.push(query.boardId); }

    let orderBy = 'ORDER BY p.createdAt DESC';
    if (query.sort === 'hot') orderBy = 'ORDER BY p.likeCount DESC, p.commentCount DESC';
    if (query.sort === 'featured') { where += ' AND p.isFeatured = 1'; orderBy = 'ORDER BY p.createdAt DESC'; }

    const items = this.db.prepare(
      'SELECT p.id, p.title, substr(p.content, 1, 200) as summary, p.postType, p.isPinned, p.isFeatured, p.viewCount, p.likeCount, p.commentCount, p.createdAt, b.name as boardName, b.slug as boardSlug, u.username as authorName FROM posts p LEFT JOIN boards b ON p.boardId = b.id LEFT JOIN users u ON p.authorId = u.id ' + where + ' ' + orderBy + ' LIMIT ? OFFSET ?'
    ).all(...params, pageSize, offset);

    const { total } = this.db.prepare('SELECT COUNT(*) as total FROM posts p ' + where).get(...params) as { total: number };

    return { code: 0, message: 'ok', data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  @Get(':id')
  getPost(@Param('id') id: string): ApiResponse {
    const post = this.db.prepare(
      'SELECT p.*, b.name as boardName, b.slug as boardSlug, u.username as authorName FROM posts p LEFT JOIN boards b ON p.boardId = b.id LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?'
    ).get(id);
    if (!post) return { code: 40400, message: '帖子不存在', data: null };

    this.db.prepare('UPDATE posts SET viewCount = viewCount + 1 WHERE id = ?').run(id);
    return { code: 0, message: 'ok', data: post };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() dto: CreatePostDto, @Req() req: { user: { userId: string; username: string } }): ApiResponse {
    const board = this.db.prepare('SELECT id FROM boards WHERE id = ?').get(dto.boardId);
    if (!board) return { code: 40400, message: '板块不存在', data: null };

    const { userId, username } = req.user;
    this.db.prepare('INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)').run(userId, username);

    const id = uuidv4();
    this.db.prepare(
      'INSERT INTO posts (id, boardId, authorId, title, content) VALUES (?, ?, ?, ?, ?)'
    ).run(id, dto.boardId, userId, dto.title, dto.content);

    return { code: 0, message: '发布成功', data: { id } };
  }
}
