import { Appointment } from "src/appointment/entities/appointment.entity";
import { Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../assets/roles";

@Entity({name: 'users'})
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column({type:'varchar'})
    name: string;

    @Column({type:'varchar', unique: true})
    email: string;

    @Column({type:'date'})
    birthdate: Date;

    @Column({type:'bigint', unique: true, nullable: false})
    dni: number;

    
    @Column({type:'varchar'})
    imageProfile?:string;

    @Column({type:'varchar', default:'Sin descripción'})
    description?: string;

    @Column({type:'varchar'})
    password: string;

    @Column({type:'decimal', precision: 10, scale: 1, default: 0})
    avaregeRating?: number;

    @Column({type:'integer', default: 0})
    totalAppointments?: number;
    
    
    @Column({type:'boolean', default: false})
    isVerified: boolean;
    
    
    @Column({type:'boolean', default: true})
    isActive: boolean;
    
    @Column({type:'enum', enum: Role, default:Role.CLIENTE})
    Role: Role;
    
    @OneToMany(() => Appointment, appoiment=> appoiment.client)
    @JoinColumn({name: 'appointment_id'})
    clientAppointments: Appointment[];
    
    @OneToMany(()=>Appointment, appoiment=> appoiment.professional)
    professionalAppointments: Appointment[];
    
    // @OneToMany(() => Addres, addres => addres.user)
    // addresses: Addres[];

    
    // @OneToOne(()=> Membership, membership => membership.user)
    // @JoinColumn({name: 'membership_id'})
    // membership: Membership;


    // @ManyToMany(() => Subcategories, subcategory => subcategory.users)
    // subcategories?: Subcategories[];




}
