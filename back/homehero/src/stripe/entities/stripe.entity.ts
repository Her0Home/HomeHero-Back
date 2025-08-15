import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // Ajusta la ruta según tu estructura

@Entity('PAYMENTS')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  UniqueID: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('date')
  date: Date;

  @Column('boolean')
  status: boolean;

  @Column()
  user_id: string;

  // Campos adicionales para Stripe
  @Column({ nullable: true })
  stripePaymentId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  // Relación con el usuario
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}