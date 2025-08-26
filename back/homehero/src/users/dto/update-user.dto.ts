import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Role } from "../assets/roles";
import { Type } from "class-transformer";

export class updateRole{
    @IsNotEmpty()
    role: Role;
}

export class UpdateUser{

    @IsOptional()
    @IsArray()
    @IsUUID('all', {each: true})
    categoriesId?: string[]


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

}
