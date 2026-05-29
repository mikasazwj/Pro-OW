import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsString, IsEmail, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import type { ApiResponse } from '@pro-ow/shared';

class RegisterDto {
  @IsString()
  @MinLength(3)
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
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
