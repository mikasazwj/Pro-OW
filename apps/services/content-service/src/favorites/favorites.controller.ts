import { Controller, Get, Post, Delete, Param, Inject, HttpCode, HttpStatus, UseGuards, Req, Query } from '@nestjs/common';
import { IsOptional } from 'class-validator';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ApiResponse } from '@pro-ow/shared';

class ListFavoritesQuery {
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
}

@Controller('favorites')
export class FavoritesController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getFavorites(@Req() req: { user: { userId: string } }, @Query() query: ListFavoritesQuery): ApiResponse {
    const page = query.page || 1;
    const pageSize = Math.min(query.pageSize || 20, 50);
    const offset = (page - 1) * pageSize;
    const items = this.db.prepare(
      "SELECT f.id as favId, f.createdAt as favAt, p.id, p.title, substr(p.content,1,200) as summary, p.likeCount, p.commentCount, p.createdAt, b.name as boardName, COALESCE(u.nickname,u.username) as authorName FROM favorites f JOIN posts p ON f.targetId = p.id LEFT JOIN boards b ON p.boardId = b.id LEFT JOIN users u ON p.authorId = u.id WHERE f.userId = ? AND f.targetType = 'post' ORDER BY f.createdAt DESC LIMIT ? OFFSET ?"
    ).all(req.user.userId, pageSize, offset);
    const { total } = this.db.prepare("SELECT COUNT(*) as total FROM favorites WHERE userId = ? AND targetType = 'post'").get(req.user.userId) as { total: number };
    return { code: 0, message: 'ok', data: { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  @Post(':targetType/:targetId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  addFavorite(@Param('targetType') targetType: string, @Param('targetId') targetId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    const existing = this.db.prepare('SELECT id FROM favorites WHERE userId = ? AND targetType = ? AND targetId = ?').get(req.user.userId, targetType, targetId);
    if (existing) return { code: 0, message: '已收藏', data: { favorited: true } };
    this.db.prepare('INSERT INTO favorites (id, userId, targetType, targetId) VALUES (?, ?, ?, ?)').run(uuidv4(), req.user.userId, targetType, targetId);
    if (targetType === 'post') this.db.prepare('UPDATE posts SET favoriteCount = favoriteCount + 1 WHERE id = ?').run(targetId);
    return { code: 0, message: '收藏成功', data: { favorited: true } };
  }

  @Delete(':targetType/:targetId')
  @UseGuards(JwtAuthGuard)
  removeFavorite(@Param('targetType') targetType: string, @Param('targetId') targetId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    this.db.prepare('DELETE FROM favorites WHERE userId = ? AND targetType = ? AND targetId = ?').run(req.user.userId, targetType, targetId);
    if (targetType === 'post') this.db.prepare('UPDATE posts SET favoriteCount = MAX(0, favoriteCount - 1) WHERE id = ?').run(targetId);
    return { code: 0, message: '取消收藏', data: { favorited: false } };
  }

  @Get('check/:targetType/:targetId')
  @UseGuards(JwtAuthGuard)
  checkFavorite(@Param('targetType') targetType: string, @Param('targetId') targetId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    const fav = this.db.prepare('SELECT id FROM favorites WHERE userId = ? AND targetType = ? AND targetId = ?').get(req.user.userId, targetType, targetId);
    return { code: 0, message: 'ok', data: { favorited: !!fav } };
  }
}