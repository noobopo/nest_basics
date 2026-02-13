import { IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQuaryDto } from "src/common/dto/pagination-quary.dto";

export class FindPostQuaryDto extends PaginationQuaryDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string
}