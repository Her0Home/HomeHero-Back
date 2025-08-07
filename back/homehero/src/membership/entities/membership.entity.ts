import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { typeMemberships } from '../enums/enum-type';
import { User } from 'src/users/entities/user.entity';

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

  @Column({type: 'enum', enum: typeMemberships, default: typeMemberships.FREE})
  membershipType: typeMemberships;

  @OneToOne(()=>User, user=> user.membership)
  @JoinColumn({name: 'user_id'})
  user: User;
}

