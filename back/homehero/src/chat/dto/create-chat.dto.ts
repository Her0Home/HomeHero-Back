import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateChatDto {
  @IsNotEmpty()
  @IsUUID()
  appointmentId: string;
}