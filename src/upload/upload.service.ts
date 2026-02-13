import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
    private readonly s3 = new S3Client({
        region: process.env.S3_REGION!,
        endpoint: process.env.S3_ENDPOINT!,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        forcePathStyle: false,
    });

    async uploadFile(
        file: Express.Multer.File,
        folder?: string,
        isPublic = true,
    ): Promise<{ url: string; key: string }> {
        try {
            const ext = file.originalname.split('.').pop();
            const key = `${folder || process.env.S3_MEDIA_FOLDER}/${randomUUID()}.${ext}`;

            await this.s3.send(
                new PutObjectCommand({
                    Bucket: process.env.S3_BUCKET!,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: isPublic ? 'public-read' : 'private',
                }),
            );

            const url = isPublic
                ? `${process.env.S3_CDN}/${key}`
                : `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`;

            return { url, key };
        } catch (err) {
            console.error('S3 upload error:', err);
            throw new InternalServerErrorException('S3 upload failed');
        }
    }
}
