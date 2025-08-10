import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { Role } from "../assets/roles";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProfesionalDto {
    @ApiProperty({
        example: "Juan Pérez",
        description: "Nombre completo del profesional"
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: "example@gmail.com",
        description: "Correo electrónico del profesional"
    })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: "1990-05-15",
        description: "Fecha de nacimiento en formato ISO (YYYY-MM-DD)"
    })
    @Type(() => Date)
    @IsNotEmpty()
    birthdate: Date;

    @ApiProperty({
        example: 12345678,
        description: "Número de DNI del profesional"
    })
    @IsNotEmpty()
    dni: number;

    @ApiProperty({
        example: "https://miapp.com/images/profile123.jpg",
        description: "URL de la imagen de perfil",
        required: false
    })
    @IsString()
    imageProfile?: string;

    @ApiProperty({
        example: "SecurePassword123!",
        description: "Contraseña del profesional"
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: Role.CLIENTE,
        enum: [Role.CLIENTE, Role.PROFESSIONAL],
        description: "Rol del usuario (solo se permite CLIENTE o PROFESIONAL)"
    })
    @IsNotEmpty()
    role: Role;

    @ApiProperty({
        example: "Especialista en reparaciones eléctricas y mantenimiento general.",
        description: "Descripción de los servicios que ofrece el profesional"
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        example: ["3fa85f64-5717-4562-b3fc-2c963f66afa6", "c3e65b12-8f53-45e9-bb2e-ec7f0be7b38f"],
        description: "Lista de IDs de categorías a las que pertenece",
        type: [String]
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID("all", { each: true })
    categoryIds: string[];

    @ApiProperty({
        example: ["4fa85f64-5717-4562-b3fc-2c963f66afa6", "d4e65b12-8f53-45e9-bb2e-ec7f0be7b38f"],
        description: "Lista de IDs de subcategorías a las que pertenece",
        type: [String]
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsUUID("all", { each: true })
    subCategoryIds: string[];
}
