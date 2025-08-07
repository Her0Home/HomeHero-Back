import { PartialType } from '@nestjs/mapped-types';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
 
}
