import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAddreDto {

    @IsNotEmpty()
    @IsNumber()
    streetNumber:number ; 
    
    @IsNotEmpty()
    @IsString()
    city : string;

    @IsOptional()
    @IsString()
    aptoNumber : string; 

}
