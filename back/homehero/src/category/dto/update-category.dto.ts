import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsArray, IsNotEmpty } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
    id: number;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsArray()
    subCategoryArray: number[];

    @IsNotEmpty()
    users_id: number;
}
