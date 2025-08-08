import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.chat)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Appointment, (appointment) => appointment.chat)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment[];
}
