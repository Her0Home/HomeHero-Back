import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from "class-validator";
import { Role } from "../assets/roles";
import { Type } from "class-transformer";

export class updateRole{
    @IsNotEmpty()
    role: Role;
}

export class UpdateUser{

    @IsOptional()
    @IsString()
    categoriesId?: string;


    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    birthdate: Date;

    @IsString()
    @IsNotEmpty()
    city: string;


    @IsString()
    @IsNotEmpty()
    aptoNumber: string;

    @IsNotEmpty()
    streetNumber: number;

    @IsOptional()
    @IsString()
    imageProfile?: string;

    @IsOptional()
    subCategoriesName: string[];

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d{7,8}$/, { message: 'El DNI debe tener entre 7 y 8 dígitos' })
    dni: string;

}
