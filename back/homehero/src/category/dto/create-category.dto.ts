import { IsArray, IsNotEmpty } from "class-validator";
import { SubCategory } from "src/subcategory/entities/subcategory.entity";
import { User } from "src/users/entities/user.entity";

export class CreateCategoryDto {
    
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsArray()
    subCategoryArray: string[];

    @IsNotEmpty()
    users_id: string;
}
