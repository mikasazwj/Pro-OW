import { Controller, Get, Post, Delete, Body, Param, Query, Inject, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { filterContent, checkRateLimit } from '../common/content-filter';
import type { ApiResponse } from '@pro-ow/shared';

class CreatePostDto {
  @IsString() boardId!: string;
  @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @IsString() @MinLength(10) content!: string;
}
class ListPostsQuery {
  @IsOptional() @IsString() boardId?: string;
  @IsOptional() @IsString() authorId?: string;
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
    if (query.authorId) { where += ' AND p.authorId = ?'; params.push(query.authorId); }
    let orderBy = 'ORDER BY p.createdAt DESC';
    if (query.sort === 'hot') orderBy = 'ORDER BY p.likeCount DESC, p.commentCount DESC';
    if (query.sort === 'featured') { where += ' AND p.isFeatured = 1'; orderBy = 'ORDER BY p.createdAt DESC'; }
    const items = this.db.prepare("SELECT p.id, p.title, substr(p.content, 1, 200) as summary, p.postType, p.isPinned, p.isFeatured, p.viewCount, p.likeCount, p.commentCount, p.createdAt, b.name as boardName, b.slug as boardSlug, COALESCE(u.nickname, u.username) as authorName FROM posts p LEFT JOIN boards b ON p.boardId = b.id LEFT JOIN users u ON p.authorId = u.id " + where + " " + orderBy + " LIMIT ? OFFSET ?").all(...params, pageSize, offset);
    const { total } = this.db.prepare('SELECT COUNT(*) as total FROM posts p ' + where).get(...params) as { total: number };
    return { code: 0, message: 'ok', data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  @Get(':id')
  getPost(@Param('id') id: string): ApiResponse {
    const post = this.db.prepare('SELECT p.*, p.authorId, b.name as boardName, b.slug as boardSlug, COALESCE(u.nickname, u.username) as authorName FROM posts p LEFT JOIN boards b ON p.boardId = b.id LEFT JOIN users u ON p.authorId = u.id WHERE p.id = ?').get(id);
    if (!post) return { code: 40400, message: '帖子不存在', data: null };
    this.db.prepare('UPDATE posts SET viewCount = viewCount + 1 WHERE id = ?').run(id);
    return { code: 0, message: 'ok', data: post };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  createPost(@Body() dto: CreatePostDto, @Req() req: { user: { userId: string; username: string; nickname: string | null; role: string; status: string; mutedUntil: string | null } }): ApiResponse {
    if (req.user.status === 'banned') return { code: 40300, message: '账号已被封禁', data: null };
    if (req.user.mutedUntil && new Date(req.user.mutedUntil) > new Date()) return { code: 40300, message: '账号已被禁言至 ' + req.user.mutedUntil, data: null };
    if (!checkRateLimit(req.user.userId, 'createPost', 2, 60000)) return { code: 42900, message: '发帖太频繁，请1分钟后再试', data: null };
    const board = this.db.prepare('SELECT id FROM boards WHERE id = ?').get(dto.boardId);
    if (!board) return { code: 40400, message: '板块不存在', data: null };

    const { filtered: filteredTitle } = filterContent(dto.title);
    const { filtered: filteredContent, hasFiltered } = filterContent(dto.content);

    const { userId, username, nickname } = req.user;
    this.db.prepare('INSERT OR REPLACE INTO users (id, username, nickname) VALUES (?, ?, ?)').run(userId, username, nickname);

    const id = uuidv4();
    this.db.prepare('INSERT INTO posts (id, boardId, authorId, title, content, status) VALUES (?, ?, ?, ?, ?, ?)').run(id, dto.boardId, userId, filteredTitle, filteredContent, 'published');
    const authorName = nickname || username;
    return { code: 0, message: hasFiltered ? '发布成功（含敏感词已过滤）' : '发布成功', data: { id, authorName } };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deletePost(@Param('id') id: string, @Req() req: { user: { userId: string; role: string } }): ApiResponse {
    const post = this.db.prepare('SELECT authorId FROM posts WHERE id = ?').get(id) as { authorId: string } | undefined;
    if (!post) return { code: 40400, message: '帖子不存在', data: null };
    if (req.user.role !== 'admin' && post.authorId !== req.user.userId) return { code: 40300, message: '无权限删除此帖子', data: null };
    this.db.prepare("UPDATE posts SET status = 'deleted' WHERE id = ?").run(id);
    return { code: 0, message: '删除成功', data: null };
  }
}