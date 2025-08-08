import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsDate, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../Enum/appointmentStatus.enum';
import { Type } from 'class-transformer';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

 
  @IsOptional()
   @Type(() => Date)
   @IsDate()
  date?: Date;
 
  @IsOptional()
  @IsString()
  time?: string;
}

