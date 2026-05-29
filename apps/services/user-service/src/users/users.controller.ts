import { Controller, Get, Param } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { ApiResponse } from '@pro-ow/shared';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaClient) {}

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<ApiResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, avatarUrl: true, role: true, createdAt: true },
    });
    if (!user) {
      return { code: 40400, message: '用户不存在', data: null };
    }
    return { code: 0, message: 'ok', data: user };
  }
}
