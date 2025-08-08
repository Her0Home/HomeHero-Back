import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    image: string;

    @ManyToOne(() => User, (user) => user.image, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Appointment, (appointment) => appointment.image, {
        nullable: true,
    })
    @JoinColumn({ name: 'appointment_id' })
    appointment: Appointment;
}
