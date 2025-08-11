import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
  Column
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';
import { Message } from 'src/message/entities/message.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

   @Column({ type: 'text', nullable: true })
  lastMessageContent?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastMessageAt?: Date;

  @OneToOne(() => Appointment, (appointment) => appointment.chat)
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => User, (user) => user.clientChats)
  @JoinColumn({ name: 'cliente_id' })
  cliente: User;

  @ManyToOne(() => User, (user) => user.profesionalChats)
  @JoinColumn({ name: 'profesional_id' })
  profesional: User;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];

  

  
}
