import { IsNotEmpty, IsInt } from 'class-validator';

export class FinishAppointmentDto {
  @IsNotEmpty()
  @IsInt()
  token: number;

  @IsNotEmpty()
  appointmentId: string;
}
