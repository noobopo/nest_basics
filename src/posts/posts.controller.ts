import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { PostsService } from './posts.service';
import { createPostDto } from './dtos/create-post.dto';
import { PostExistPipe } from './pipes/post-exist.pipe';
import { updatePostDto } from './dtos/update-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decoraters/current-user.decorater';
import { User, userRole } from 'src/auth/entities/user.entitie';
import { Roles } from 'src/auth/decoraters/roles.decoraters';
import { FindPostQuaryDto } from './dtos/find-post-quary.dto';
import { IPaginationResponseFormat } from 'src/common/interface/pagination.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/config/multer.config';

@Controller('posts')
export class PostsController {
    constructor(private readonly postService: PostsService) { }

    @Get('all')
    async getAll(@Query() quary: FindPostQuaryDto) {
        const posts = await this.postService.get_All_Post(quary)
        return posts
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.postService.findOne(id)
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(FileInterceptor('image', multerConfig))
    @Post('create')
    async createPost(
        @Body() createData: createPostDto,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: any,
    ) {
        return await this.postService.createPost(createData, file, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id')
    async update(@Param('id') id: number, @Body(PostExistPipe) updateData: updatePostDto, @CurrentUser() user: User) {
        return await this.postService.updatePost(id, updateData, user)
    }

    @Roles(userRole.ADMIN)
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deletePost(@Param('id') id: number) {
        return await this.postService.deletePost(id)
    }

}
