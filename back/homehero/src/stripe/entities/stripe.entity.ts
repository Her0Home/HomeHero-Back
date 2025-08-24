import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('PAYMENTS')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  UniqueID: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('timestamp')
  date: Date;

  @Column('boolean')
  status: boolean;

  @Column()
  user_id: string;


  @Column({ nullable: true })
  stripePaymentId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}