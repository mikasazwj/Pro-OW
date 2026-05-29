import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { BoardsController } from './boards/boards.controller';
import { PostsController } from './posts/posts.controller';
import { CommentsController } from './comments/comments.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [BoardsController, PostsController, CommentsController],
})
export class AppModule {}
