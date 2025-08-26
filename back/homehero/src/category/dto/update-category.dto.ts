import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsArray, IsNotEmpty } from 'class-validator';
import { SubCategory } from 'src/subcategory/entities/subcategory.entity';
import { User } from 'src/users/entities/user.entity';

export class UpdateCategoryDto{
    
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsArray()
    subCategoryArray: string[];

    @IsNotEmpty()
    users_id: string;
}
