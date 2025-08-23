
import { Chat } from 'src/chat/entities/chat.entity';
import { User } from 'src/users/entities/user.entity';
import { Image } from '../../images/entities/image.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppointmentStatus } from '../Enum/appointmentStatus.enum';

@Entity({
  name: 'APPOINTMENTS',
})
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'date',
  })
  date: Date;

  @Column({
    type: 'time',
  })
  time: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column({
    type: 'int',
  })
  token: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
  })
  status: AppointmentStatus;

  @Column({
    type: 'text',
  })
  imageService: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  canComment: boolean;

  @ManyToOne(() => User, (user) => user.clientAppointments)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => User, (user) => user.professionalAppointments)
  @JoinColumn({ name: 'professional_id' })
  professional: User;

  @OneToOne(() => Chat, (chat) => chat.appointment)
  chat: Chat;
  

  @OneToMany(() => Image, (image) => image.appointment)
  @JoinColumn({ name: 'image_id' })
  image: Image[];
  
}
