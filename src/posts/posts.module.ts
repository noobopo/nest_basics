import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Post]), UploadModule],
  controllers: [PostsController],
  providers: [PostsService]
})
export class PostsModule {}
