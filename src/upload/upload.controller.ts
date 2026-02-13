import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../config/multer.config';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', multerConfig))
    async upload(@UploadedFile() file: Express.Multer.File) {
        const result = await this.uploadService.uploadFile(file);

        return {
            success: true,
            url: result.url,
            key: result.key,
            folder: process.env.S3_MEDIA_FOLDER,
        };
    }
}
