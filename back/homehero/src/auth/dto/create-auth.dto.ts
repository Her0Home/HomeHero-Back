import { IsEmail, IsNotEmpty } from "class-validator";

export class credentialsDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

}
