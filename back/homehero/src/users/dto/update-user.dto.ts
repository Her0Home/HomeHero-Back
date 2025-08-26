import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Role } from "../assets/roles";

export class updateCategoryDTO{
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID('all')
    categoriesId: string[]
}

export class updateRole{
    @IsNotEmpty()
    role: Role;
}
