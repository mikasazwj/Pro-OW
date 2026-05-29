import { Controller, Get, Post, Delete, Param, Inject, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ApiResponse } from '@pro-ow/shared';

@Controller('follows')
export class FollowsController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get('following')
  @UseGuards(JwtAuthGuard)
  getFollowing(@Req() req: { user: { userId: string } }): ApiResponse {
    const items = this.db.prepare(
      'SELECT f.followingId as id, COALESCE(u.nickname, u.username) as username FROM follows f JOIN users u ON f.followingId = u.id WHERE f.followerId = ? ORDER BY f.createdAt DESC'
    ).all(req.user.userId);
    return { code: 0, message: 'ok', data: { items } };
  }

  @Get('followers/:userId')
  getFollowers(@Param('userId') userId: string): ApiResponse {
    const items = this.db.prepare(
      'SELECT f.followerId as id, COALESCE(u.nickname, u.username) as username FROM follows f JOIN users u ON f.followerId = u.id WHERE f.followingId = ? ORDER BY f.createdAt DESC'
    ).all(userId);
    return { code: 0, message: 'ok', data: { items } };
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  follow(@Param('userId') followingId: string, @Req() req: { user: { userId: string; username: string; nickname: string | null } }): ApiResponse {
    if (followingId === req.user.userId) return { code: 40000, message: '不能关注自己', data: null };
    const existing = this.db.prepare('SELECT id FROM follows WHERE followerId = ? AND followingId = ?').get(req.user.userId, followingId);
    if (existing) return { code: 0, message: '已关注', data: { following: true } };
    this.db.prepare('INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)').run(followingId, 'user-' + followingId.slice(0, 8));
    this.db.prepare('INSERT INTO follows (id, followerId, followingId) VALUES (?, ?, ?)').run(uuidv4(), req.user.userId, followingId);
    const followerName = req.user.nickname || req.user.username;
    this.db.prepare('INSERT INTO notifications (id, userId, title, content, sourceType, sourceId) VALUES (?, ?, ?, ?, ?, ?)').run(uuidv4(), followingId, '新粉丝', followerName + ' 关注了你', 'user', req.user.userId);
    return { code: 0, message: '关注成功', data: { following: true } };
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  unfollow(@Param('userId') followingId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    this.db.prepare('DELETE FROM follows WHERE followerId = ? AND followingId = ?').run(req.user.userId, followingId);
    return { code: 0, message: '取消关注', data: { following: false } };
  }

  @Get('check/:userId')
  @UseGuards(JwtAuthGuard)
  checkFollow(@Param('userId') followingId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    const f = this.db.prepare('SELECT id FROM follows WHERE followerId = ? AND followingId = ?').get(req.user.userId, followingId);
    return { code: 0, message: 'ok', data: { following: !!f } };
  }
}