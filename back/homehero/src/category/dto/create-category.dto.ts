import { IsArray, IsNotEmpty } from "class-validator";

export class CreateCategoryDto {
    id: number;
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsArray()
    subCategoryArray: number[];

    @IsNotEmpty()
    users_id: number;
}
