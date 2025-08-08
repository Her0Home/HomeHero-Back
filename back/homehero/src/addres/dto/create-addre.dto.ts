import { IsNotEmpty } from "class-validator";

export class CreateAddreDto {

    @IsNotEmpty()
    addres: string;

}
