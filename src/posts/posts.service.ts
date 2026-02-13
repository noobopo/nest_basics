import { ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IPost } from './interfaces/post.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { createPostDto } from './dtos/create-post.dto';
import { updatePostDto } from './dtos/update-post.dto';
import { User, userRole } from 'src/auth/entities/user.entitie';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindPostQuaryDto } from './dtos/find-post-quary.dto';
import { IPaginationResponseFormat } from 'src/common/interface/pagination.interface';

@Injectable()
export class PostsService {
    private postListCacheKey: Set<string> = new Set()

    constructor(
        @InjectRepository(Post)
        private postRepositry: Repository<Post>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    private generateCacheKey(quary: FindPostQuaryDto): string {
        const { page = 1, limit = 10, title } = quary
        return `post_List_page${page}_limt${limit}_title${title || 'all'}`
    }

    async get_All_Post(quary: FindPostQuaryDto): Promise<IPaginationResponseFormat<Post>> {
        const cacheKey = this.generateCacheKey(quary)
        this.postListCacheKey.add(cacheKey)
        const getCachedData = await this.cacheManager.get<IPaginationResponseFormat<Post>>(cacheKey)
        if (getCachedData) {
            console.log(`Returning data from cache key ${cacheKey}`);
            return getCachedData
        }
        console.log(`Returning data from DB`);
        const { page = 1, limit = 10, title } = quary

        const skip = (page - 1) * limit

        const quaryBuilder = this.postRepositry.createQueryBuilder('post')
            .leftJoinAndSelect('post.auther', 'auther').orderBy('post.createdAt', 'DESC').skip(skip).take(limit)

        if (title) {
            quaryBuilder.andWhere('post.title ILIKE :title', { title: '%${title}%' })
        }
        const [items, totalItems] = await quaryBuilder.getManyAndCount()
        const totalPages = Math.ceil(totalItems / limit)
        const responseResult = {
            items,
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages
            }
        }
        await this.cacheManager.set(cacheKey,responseResult, 30000)
        return responseResult
    }

    async findOne(id: number): Promise<Post> {
        const cacheKey = `v1:post:${id}` 

        const cachedPost = await this.cacheManager.get<Post>(cacheKey)

        if (cachedPost) {
            console.log(`Returning from cache: ${cacheKey}`)
            return cachedPost
        }
        console.log('return from db');
        
        const post = await this.postRepositry
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.auther', 'auther')
            .where('post.id = :id', { id })
            .getOne()

        if (!post) {
            throw new NotFoundException(`No Post Found With This Id ${id}`)
        }

        await this.cacheManager.set(cacheKey, post, 3000)

        return post
    }


    async createPost(postData: createPostDto, auther: User): Promise<Post> {
        const newPost = this.postRepositry.create({
            title: postData.title,
            content: postData.content,
            auther
        })
        await this.invalidateAllCacheData()

        return await this.postRepositry.save(newPost)
    }

    async updatePost(id: number, updateData: updatePostDto, user: User): Promise<Post> {
        const post = await this.findOne(id)
        if (post.auther.id !== user.id && user.role !== userRole.ADMIN) {
            throw new ForbiddenException('You dont have permition to update the post!')
        }
        if (updateData.title) {
            post.title = updateData.title
        }
        if (updateData.content) {
            post.content = updateData.content
        }
        const updatedPost = await this.postRepositry.save(post)
        await this.cacheManager.del(`v1:post:${id}`)
        await this.invalidateAllCacheData()
        return updatedPost
    }

    async deletePost(id: number): Promise<Post> {
        const post = await this.findOne(id)
        return await this.postRepositry.remove(post)
    }

    private async invalidateAllCacheData(): Promise<void>{
        for (const key of this.postListCacheKey) {
            await this.cacheManager.del(key)
        }
        this.postListCacheKey.clear()
    }
}
