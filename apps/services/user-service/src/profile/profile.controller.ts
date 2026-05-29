import { Controller, Get, Put, Body, Inject, UseGuards, Req } from '@nestjs/common';
import { IsString, IsOptional, MaxLength } from 'class-validator';
import Database from 'better-sqlite3';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { ApiResponse } from '@pro-ow/shared';

class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(30) nickname?: string;
  @IsOptional() @IsString() @MaxLength(200) bio?: string;
  @IsOptional() @IsString() avatarUrl?: string;
}

@Controller('profile')
export class ProfileController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: { user: { userId: string } }): ApiResponse {
    const user = this.db.prepare(
      'SELECT id, username, nickname, bio, avatarUrl, role, createdAt FROM users WHERE id = ?'
    ).get(req.user.userId);
    if (!user) return { code: 40400, message: '用户不存在', data: null };
    return { code: 0, message: 'ok', data: user };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  updateProfile(@Body() dto: UpdateProfileDto, @Req() req: { user: { userId: string } }): ApiResponse {
    const updates: string[] = [];
    const params: unknown[] = [];
    if (dto.nickname !== undefined) { updates.push('nickname = ?'); params.push(dto.nickname); }
    if (dto.bio !== undefined) { updates.push('bio = ?'); params.push(dto.bio); }
    if (dto.avatarUrl !== undefined) { updates.push('avatarUrl = ?'); params.push(dto.avatarUrl); }
    if (updates.length === 0) return { code: 40000, message: '没有要更新的字段', data: null };
    updates.push('updatedAt = datetime(\'now\')');
    params.push(req.user.userId);
    this.db.prepare('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?').run(...params);
    const user = this.db.prepare('SELECT id, username, nickname, bio, avatarUrl, role, createdAt FROM users WHERE id = ?').get(req.user.userId);
    return { code: 0, message: '更新成功', data: user };
  }
}