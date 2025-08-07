import { Appointment } from "src/appointment/entities/appointment.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne } from "typeorm";
import { Role } from "../assets/roles";

@Entity({name: 'users'})
export class User {

    @Column({type:'varchar'})
    name: string;

    @Column({type:'varchar', unique: true})
    email: string;

    @Column({type:'date'})
    birthdate: Date;

    @Column({type:'bigint', unique: true})
    dni: number;

    // @OneToMany(() => Addres, addres => addres.user)
    // addresses: Addres[];

    @Column({type:'varchar'})
    imageProfile?:string;

    @Column({type:'varchar'})
    description?: string;

    @Column({type:'varchar'})
    password: string;

    @Column({type:'decimal', precision: 10, scale: 1, default: 0})
    avaregeRating?: number;

    @Column({type:'integer', default: 0})
    totalAppointments?: number;

    // @OneToOne(()=> Membership, membership => membership.user)
    // @JoinColumn({name: 'membership_id'})
    // membership: Membership;

    @Column({type:'boolean', default: false})
    isVerified: boolean;

    // @OneToMany(() => Appointment, appoiment=> appoiment.user)
    // @JoinColumn({name: 'appointment_id'})
    // appointments: Appointment[];

    @Column({type:'boolean', default: false})
    isActive: boolean;

    @Column({type:'enum', enum: Role, nullable:false})
    Role: Role;

    

    // @ManyToMany(() => Subcategories, subcategory => subcategory.users)
    // subcategories?: Subcategories[];




}
