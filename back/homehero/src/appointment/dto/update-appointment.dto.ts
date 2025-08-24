import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { AppointmentStatus } from '../Enum/appointmentStatus.enum';
import { Type } from 'class-transformer';

export class UpdateAppointmentDto  {
@IsNotEmpty()
  @IsUUID()
  userId: string;
 
@IsOptional()
  @Type(() => Date) 
  @IsDate()
  newStartTime?: Date ;
}

