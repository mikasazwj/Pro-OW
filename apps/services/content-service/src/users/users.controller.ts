import { Controller, Get, Param, Inject } from '@nestjs/common';  
import Database from 'better-sqlite3';  
import type { ApiResponse } from '@pro-ow/shared';  
  
@Controller()  
export class UsersController {  
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}  
  
  @Get('users/:id/stats')  
  getUserStats(@Param('id') id: string): ApiResponse {  
    const u = this.db.prepare('SELECT id, username, nickname, exp, level, createdAt FROM users WHERE id = ?').get(id);  
    if (!u) return { code: 40400, message: 'User not found', data: null };  
    const pc = (this.db.prepare("SELECT COUNT(*) as cnt FROM posts WHERE authorId = ? AND status = 'published'").get(id) as { cnt: number }).cnt;  
    const cc = (this.db.prepare("SELECT COUNT(*) as cnt FROM comments WHERE authorId = ? AND status = 'published'").get(id) as { cnt: number }).cnt;  
    const lr = (this.db.prepare("SELECT COALESCE(SUM(p.likeCount), 0) as total FROM posts p WHERE p.authorId = ? AND p.status = 'published'").get(id) as { total: number }).total;  
    return { code: 0, message: 'ok', data: { ...u as object, postCount: pc, commentCount: cc, likeReceived: lr } };  
  }  
  
  @Get('leaderboard')  
  getLeaderboard(): ApiResponse {  
    const items = this.db.prepare("SELECT id, username, nickname, exp, level, (SELECT COUNT(*) FROM posts WHERE authorId = users.id AND status = 'published') as postCount, (SELECT COUNT(*) FROM comments WHERE authorId = users.id AND status = 'published') as commentCount FROM users ORDER BY exp DESC LIMIT 50").all();  
    return { code: 0, message: 'ok', data: items };  
  }  
} 
