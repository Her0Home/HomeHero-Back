import { IsNotEmpty, IsString, IsUUID, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  rating: number;

  @IsNotEmpty()
  @IsUUID()
  receiverId: string;

  @IsNotEmpty()
  @IsUUID()
  appointmentId: string;
}