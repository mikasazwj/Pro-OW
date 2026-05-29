import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { ApiResponse } from '@pro-ow/shared';

class RegisterDto {
  @IsString() @MinLength(3) username!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(6) password!: string;
}
class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}
class RefreshDto {
  @IsString() refreshToken!: string;
}
class VerifyEmailDto {
  @IsString() code!: string;
}
class MuteDto {
  @IsString() userId!: string;
  hours?: number;
}
class StatusDto {
  @IsString() userId!: string;
  @IsString() status!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<ApiResponse> {
    const user = await this.authService.register(dto);
    return { code: 0, message: '注册成功', data: { userId: user.id, username: user.username, devCode: user.verificationCode } };
  }

  @Post('verify-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto, @Req() req: { user: { userId: string } }): Promise<ApiResponse> {
    await this.authService.verifyEmail(req.user.userId, dto.code);
    return { code: 0, message: '邮箱验证成功', data: { verified: true } };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<ApiResponse> {
    const result = await this.authService.login(dto);
    return { code: 0, message: 'ok', data: result };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto): Promise<ApiResponse> {
    const result = await this.authService.refresh(dto.refreshToken);
    return { code: 0, message: 'ok', data: result };
  }

  @Post('admin/ban')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async banUser(@Body() dto: StatusDto, @Req() req: { user: { role: string } }): Promise<ApiResponse> {
    if (req.user.role !== 'admin') return { code: 40300, message: '权限不足', data: null };
    const result = await this.authService.setUserStatus(dto.userId, dto.status);
    return { code: 0, message: 'ok', data: result };
  }

  @Post('admin/mute')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async muteUser(@Body() dto: MuteDto, @Req() req: { user: { role: string } }): Promise<ApiResponse> {
    if (req.user.role !== 'admin') return { code: 40300, message: '权限不足', data: null };
    const result = await this.authService.muteUser(dto.userId, dto.hours || 24);
    return { code: 0, message: 'ok', data: result };
  }
}