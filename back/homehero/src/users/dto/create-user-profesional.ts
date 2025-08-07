import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Role } from "../assets/roles";
import { Type } from "class-transformer";

export class CreateProfesionalDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Type(() => Date)//permite convertir de string a Date
    @IsNotEmpty()
    birthdate: Date;


    @IsNotEmpty()
    dni: number;

    @IsString()
    imageProfile?: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID("all", { each: true }) // valida que todos los elementos sean UUID
    categoryIds: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsUUID("all", { each: true }) // valida que todos los elementos sean UUID
    subCategoryIds: string[];

}