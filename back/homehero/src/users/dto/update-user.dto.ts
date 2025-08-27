import { ArrayNotEmpty, IsArray, IsDate, IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";
import { Role } from "../assets/roles";
import { Type } from "class-transformer";

export class updateRole{
    @IsNotEmpty()
    role: Role;
}

export class UpdateUser{

    @IsOptional()
<<<<<<< HEAD
    @IsString()
    categoriesId?: string | undefined;
=======
    @IsArray()
    @IsUUID('all', {each: true})
    categoriesId?: string;
>>>>>>> 482982463b1e7cc084be8e4e8208e60ae1c3ad23


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
