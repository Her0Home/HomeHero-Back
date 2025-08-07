import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'date' })
  membershipStart: Date;

  @Column({ type: 'date' })
  membershipEnd: Date;

  @Column({type: 'enum', enum: ['free', 'premiun']})
  membershipType: string;
}

