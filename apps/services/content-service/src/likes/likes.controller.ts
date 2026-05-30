import { Controller, Post, Delete, Param, Query, Inject, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { IsIn, IsOptional } from 'class-validator';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { calculateLevel } from '../common/content-filter';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { ApiResponse } from '@pro-ow/shared';

class LikeQuery {
  @IsOptional() @IsIn(['post', 'comment']) targetType?: string;
}

@Controller()
export class LikesController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Post('posts/:targetId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  likePost(@Param('targetId') targetId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    const post = this.db.prepare('SELECT id FROM posts WHERE id = ?').get(targetId);
    if (!post) return { code: 40400, message: '帖子不存在', data: null };
    return this.toggleLike(req.user.userId, 'post', targetId);
  }

  @Delete('posts/:targetId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  unlikePost(@Param('targetId') targetId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    this.db.prepare('DELETE FROM likes WHERE userId = ? AND targetType = ? AND targetId = ?').run(req.user.userId, 'post', targetId);
    const count = (this.db.prepare('SELECT COUNT(*) as cnt FROM likes WHERE targetType = ? AND targetId = ?').get('post', targetId) as { cnt: number }).cnt;
    this.db.prepare('UPDATE posts SET likeCount = ? WHERE id = ?').run(count, targetId);
    return { code: 0, message: 'ok', data: { liked: false, likeCount: count } };
  }

  @Post('comments/:targetId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  likeComment(@Param('targetId') targetId: string, @Req() req: { user: { userId: string } }): ApiResponse {
    const comment = this.db.prepare('SELECT id FROM comments WHERE id = ?').get(targetId);
    if (!comment) return { code: 40400, message: '评论不存在', data: null };
    return this.toggleLike(req.user.userId, 'comment', targetId);
  }

  private toggleLike(userId: string, targetType: string, targetId: string): ApiResponse {
    const existing = this.db.prepare('SELECT id FROM likes WHERE userId = ? AND targetType = ? AND targetId = ?').get(userId, targetType, targetId);
    if (existing) {
      this.db.prepare('DELETE FROM likes WHERE id = ?').run((existing as { id: string }).id);
    } else {
      this.db.prepare('INSERT INTO likes (id, userId, targetType, targetId) VALUES (?, ?, ?, ?)').run(uuidv4(), userId, targetType, targetId);
      // Award +1 exp to post author when liked
      if (targetType === 'post') {
        try {
          const post = this.db.prepare('SELECT authorId FROM posts WHERE id = ?').get(targetId) as any;
          if (post && post.authorId !== userId) {
            const ur = this.db.prepare('SELECT exp FROM users WHERE id = ?').get(post.authorId) as any;
            const ne = (ur?.exp || 0) + 1;
            this.db.prepare('UPDATE users SET exp = ?, level = ? WHERE id = ?').run(ne, calculateLevel(ne), post.authorId);
          }
        } catch {}
      }
    }
    const count = (this.db.prepare('SELECT COUNT(*) as cnt FROM likes WHERE targetType = ? AND targetId = ?').get(targetType, targetId) as { cnt: number }).cnt;
    const table = targetType === 'post' ? 'posts' : 'comments';
    this.db.prepare('UPDATE ' + table + ' SET likeCount = ? WHERE id = ?').run(count, targetId);
    return { code: 0, message: 'ok', data: { liked: !existing, likeCount: count } };
  }
}
