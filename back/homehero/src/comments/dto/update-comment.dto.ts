import { Exclude, Expose, Transform } from 'class-transformer';

export class ResponseCommentDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  rating: number;

  @Expose()
  createdAt: Date;

  @Expose()
  senderId: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.sender ? {
      id: obj.sender.id,
      name: obj.sender.name,
      imageProfile: obj.sender.imageProfile
    } : null;
  })
  sender: any;

  @Expose()
  receiverId: string;

  @Expose()
  @Transform(({ obj }) => {
    return obj.receiver ? {
      id: obj.receiver.id,
      name: obj.receiver.name,
      imageProfile: obj.receiver.imageProfile
    } : null;
  })
  receiver: any;

  @Expose()
  appointmentId: string;
}
