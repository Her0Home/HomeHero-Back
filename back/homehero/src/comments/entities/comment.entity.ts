import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'float' })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id_send' })
  sender: User;

  @Column({ name: 'user_id_send' })
  senderId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id_get' })
  receiver: User;

  @Column({ name: 'user_id_get' })
  receiverId: string;

  @ManyToOne(() => Appointment, { eager: false })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id' })
  appointmentId: string;
}