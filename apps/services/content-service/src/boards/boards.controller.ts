import { Controller, Get, Inject } from '@nestjs/common';
import Database from 'better-sqlite3';
import type { ApiResponse } from '@pro-ow/shared';

@Controller('boards')
export class BoardsController {
  constructor(@Inject('DATABASE') private readonly db: Database.Database) {}

  @Get()
  getBoards(): ApiResponse {
    const boards = this.db.prepare(
      'SELECT id, name, slug, description, sortOrder FROM boards ORDER BY sortOrder'
    ).all();
    return { code: 0, message: 'ok', data: boards };
  }
}
