import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

interface UserRow {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject('DATABASE') private readonly db: Database.Database,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: { username: string; email: string; password: string }) {
    const existing = this.db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).get(dto.email, dto.username);
    
    if (existing) {
      throw new ConflictException('用户名或邮箱已被注册');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const id = uuidv4();
    
    this.db.prepare(
      'INSERT INTO users (id, username, email, passwordHash) VALUES (?, ?, ?, ?)'
    ).run(id, dto.username, dto.email, passwordHash);
    
    return { id, username: dto.username };
  }

  async login(dto: { email: string; password: string }) {
    const user = this.db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).get(dto.email) as UserRow | undefined;
    
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, expiresIn: 900 };
  }
}
