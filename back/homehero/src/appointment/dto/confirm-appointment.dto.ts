import { IsNotEmpty, IsUUID } from 'class-validator';

export class ConfirmAppointmentDto {
  @IsNotEmpty()
  @IsUUID()
  professionalId: string;
}