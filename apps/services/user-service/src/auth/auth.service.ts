import { Injectable, UnauthorizedException, ConflictException, Inject, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

interface UserRow {
  id: string; username: string; email: string; passwordHash: string;
  nickname: string | null; role: string; status: string; isEmailVerified: number; mutedUntil: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE') private readonly db: Database.Database,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: { username: string; email: string; password: string }) {
    const existing = this.db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(dto.email, dto.username);
    if (existing) throw new ConflictException('用户名或邮箱已被注册');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const id = uuidv4();
    this.db.prepare('INSERT INTO users (id, username, email, passwordHash) VALUES (?, ?, ?, ?)').run(id, dto.username, dto.email, passwordHash);

    // Generate verification code (in dev, auto-verify)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.db.prepare('INSERT INTO verification_codes (id, userId, code, expiresAt) VALUES (?, ?, ?, ?)').run(
      uuidv4(), id, code, new Date(Date.now() + 3600000).toISOString()
    );
    console.log(`[DEV] Verification code for ${dto.email}: ${code}`);

    return { id, username: dto.username, verificationCode: process.env.NODE_ENV === 'production' ? undefined : code };
  }

  async verifyEmail(userId: string, code: string) {
    const vc = this.db.prepare('SELECT * FROM verification_codes WHERE userId = ? AND code = ? AND used = 0 AND expiresAt > ?').get(userId, code, new Date().toISOString()) as { id: string } | undefined;
    if (!vc) throw new BadRequestException('验证码无效或已过期');
    this.db.prepare('UPDATE verification_codes SET used = 1 WHERE id = ?').run(vc.id);
    this.db.prepare('UPDATE users SET isEmailVerified = 1 WHERE id = ?').run(userId);
    return { verified: true };
  }

  async login(dto: { email: string; password: string }) {
    const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(dto.email) as UserRow | undefined;
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    if (user.status === 'banned') throw new UnauthorizedException('账号已被封禁');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('邮箱或密码错误');

    if (user.mutedUntil && new Date(user.mutedUntil) > new Date()) {
      throw new UnauthorizedException('账号已被禁言至 ' + user.mutedUntil);
    }

    const payload = { sub: user.id, username: user.username, nickname: user.nickname, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '900s' });
    const refreshToken = uuidv4();
    this.db.prepare('INSERT INTO refresh_tokens (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)').run(
      uuidv4(), user.id, refreshToken, new Date(Date.now() + 7 * 86400000).toISOString()
    );

    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async refresh(refreshToken: string) {
    const rt = this.db.prepare("SELECT * FROM refresh_tokens WHERE token = ? AND expiresAt > datetime('now')").get(refreshToken) as { userId: string } | undefined;
    if (!rt) throw new UnauthorizedException('Refresh token 无效或已过期');

    const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(rt.userId) as UserRow | undefined;
    if (!user || user.status === 'banned') throw new UnauthorizedException('账号已被封禁');

    // Rotate refresh token
    this.db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(refreshToken);
    const newRefresh = uuidv4();
    this.db.prepare('INSERT INTO refresh_tokens (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)').run(
      uuidv4(), user.id, newRefresh, new Date(Date.now() + 7 * 86400000).toISOString()
    );

    const payload = { sub: user.id, username: user.username, nickname: user.nickname, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '900s' });
    return { accessToken, refreshToken: newRefresh, expiresIn: 900 };
  }

  // Admin: ban/unban user
  async setUserStatus(targetUserId: string, status: string) {
    this.db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, targetUserId);
    return { userId: targetUserId, status };
  }

  // Admin/mod: mute user
  async muteUser(targetUserId: string, hours: number) {
    const until = new Date(Date.now() + hours * 3600000).toISOString();
    this.db.prepare('UPDATE users SET mutedUntil = ? WHERE id = ?').run(until, targetUserId);
    return { userId: targetUserId, mutedUntil: until };
  }
}