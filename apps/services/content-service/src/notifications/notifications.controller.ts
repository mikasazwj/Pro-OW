import { Controller, Get, Post, Patch, Param, Inject, UseGuards, Req } from '@nestjs/common';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ApiResponse } from '@pro-ow/shared';

@Controller('notifications')
export class NotificationsController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getNotifications(@Req() req: { user: { userId: string } }): ApiResponse {
    const items = this.db.prepare(
      'SELECT id, title, content, sourceType, sourceId, isRead, createdAt FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 50'
    ).all(req.user.userId);
    const unread = (this.db.prepare('SELECT COUNT(*) as cnt FROM notifications WHERE userId = ? AND isRead = 0').get(req.user.userId) as { cnt: number }).cnt;
    return { code: 0, message: 'ok', data: { items, unreadCount: unread } };
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  readAll(@Req() req: { user: { userId: string } }): ApiResponse {
    this.db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(req.user.userId);
    return { code: 0, message: 'ok', data: null };
  }

  // Internal helper called by comments controller
  createNotification(userId: string, title: string, content: string, sourceType: string, sourceId: string) {
    this.db.prepare('INSERT INTO notifications (id, userId, title, content, sourceType, sourceId) VALUES (?, ?, ?, ?, ?, ?)').run(uuidv4(), userId, title, content, sourceType, sourceId);
  }
}
