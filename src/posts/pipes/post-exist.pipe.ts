import { ArgumentMetadata, NotFoundException, PipeTransform } from "@nestjs/common";
import { PostsService } from "../posts.service";

export class PostExistPipe implements PipeTransform{
    constructor(private readonly postService: PostsService){}
    transform(value: any, metadata: ArgumentMetadata) {
        try {
            this.postService.findOne(value)
        } catch (error) {
            throw new NotFoundException(`post with this ${value} is not available`)
        }
        return value
    }
}