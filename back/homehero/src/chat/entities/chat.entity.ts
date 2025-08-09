<<<<<<< HEAD
export class Chat {}
=======
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
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User, (user) => user.chat)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Appointment, (appointment) => appointment.chat)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment[];
}
>>>>>>> f5dde4c79b4c396d9561955ffb49326fcc0f84a2
