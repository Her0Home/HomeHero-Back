import { AppointmentStatus } from 'src/appointment/Enum/appointmentStatus.enum';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {

  @IsNotEmpty()
  @IsUUID()
  clientId: string;

  @IsNotEmpty()
  @IsUUID()
  professionalId: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startTime: Date;

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
