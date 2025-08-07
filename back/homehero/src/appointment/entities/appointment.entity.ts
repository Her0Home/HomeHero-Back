import { AppointmentStatus } from 'src/appointmentStatus.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => User, (user) => user.ClientAppointments)
  @JoinColumn({ name: 'client_id' })
  Client: User;

  @ManyToOne(() => User, (user) => user.ProfesionalAppointments)
  @JoinColumn({ name: 'professional_id' })
  Profesional: User;

  @OneToOne(() => Chat, (chat) => chat.appointment)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @OneToMany(() => Image, (image) => image.appointment)
  images: Image[];
}
