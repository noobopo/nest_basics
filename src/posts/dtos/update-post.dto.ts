import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class updatePostDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    title?: string

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    content?: string
}