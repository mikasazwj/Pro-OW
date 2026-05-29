import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { ApiResponse } from '@pro-ow/shared';

class RegisterDto {
  username!: string;
  email!: string;
  password!: string;
}

class LoginDto {
  email!: string;
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ApiResponse> {
    const user = await this.authService.register(dto);
    return { code: 0, message: '注册成功', data: { userId: user.id, username: user.username } };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<ApiResponse> {
    const result = await this.authService.login(dto);
    return { code: 0, message: 'ok', data: result };
  }
}
