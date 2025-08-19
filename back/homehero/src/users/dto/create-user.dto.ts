import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "../assets/roles";
import { Type } from "class-transformer";

export class CreateUserDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Type(() => Date)//permite convertir de string a Date
    @IsOptional()
    birthdate?: Date;



    @IsOptional()
    dni?: number;

    @IsString()
    @IsOptional()
    imageProfile?: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

}
