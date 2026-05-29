import { Controller, Get, Param, Inject } from '@nestjs/common';
import Database from 'better-sqlite3';
import type { ApiResponse } from '@pro-ow/shared';

@Controller('users')
export class UsersController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get(':id')
  getUser(@Param('id') id: string): ApiResponse {
    const user = this.db.prepare(
      'SELECT id, username, avatarUrl, role, createdAt FROM users WHERE id = ?'
    ).get(id);
    
    if (!user) {
      return { code: 40400, message: '用户不存在', data: null };
    }
    return { code: 0, message: 'ok', data: user };
  }
}
