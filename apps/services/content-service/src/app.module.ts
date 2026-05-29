import { Module } from '@nestjs/common';
import { DatabaseModule } from './common/database.module';
import { AuthModule } from './auth/auth.module';
import { BoardsController } from './boards/boards.controller';
import { PostsController } from './posts/posts.controller';
import { CommentsController } from './comments/comments.controller';
import { UserCommentsController } from './comments/user-comments.controller';
import { LikesController } from './likes/likes.controller';
import { NotificationsController } from './notifications/notifications.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BoardsController, PostsController, CommentsController, UserCommentsController, LikesController, NotificationsController],
})
export class AppModule {}