import { Type } from "class-transformer";
import { IsNotEmpty, IsString, ValidateNested } from "class-validator";

class Subcategory {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;
}

export class CreateSubcategoryDto {
    @IsNotEmpty()
    @ValidateNested()   // Esto permite validar la clase interna
    @Type(() => Subcategory) // Necesario para que class-transformer sepa qué clase instanciar
    subcategori: Subcategory[];
}