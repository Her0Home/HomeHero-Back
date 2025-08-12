import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
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
    @IsNotEmpty()
    birthdate: Date;


    @IsNotEmpty()
    dni: number;

    @IsString()
    imageProfile?: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    role: Role;

}
