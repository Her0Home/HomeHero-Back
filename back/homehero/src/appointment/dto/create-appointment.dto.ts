import { AppointmentStatus } from 'src/appointmentStatus.enum';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { Type } from 'class-transformer';

console.log("HOLA");


export class CreateAppointmentDto {
  @IsUUID()
  clientId: string;

  @IsUUID()
  professionalId: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Time must be in HH:mm format' })
  time: string;

  @IsNotEmpty()
  @IsString()
  description: string;


  @IsNotEmpty()
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsOptional()
  @IsString()
  imageService: string;

}
