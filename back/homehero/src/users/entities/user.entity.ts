import { Appointment } from "src/appointment/entities/appointment.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../assets/roles";
import { Membership } from "src/membership/entities/membership.entity";
import { Category } from "src/category/entities/category.entity";
import { SubCategory } from "src/subcategory/entities/subcategory.entity";
import { Addre } from "src/addres/entities/addre.entity";

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
    
    
    @OneToOne(()=> Membership, membership => membership.user)
    membership: Membership;

    @ManyToMany(()=>Category, category=>category.professional)
    @JoinTable({name:'professional_category'})
    categories: Category[];
    
    
    @ManyToMany(() => SubCategory, subcategory => subcategory.professionals)
    @JoinTable({name: 'professional_subcategories'})
    subcategories?: SubCategory[];
    
    @OneToMany(()=> Addre, addre=> addre.user)
    @JoinColumn({name:'addres_id'})
    addres: Addre[]
    // @OneToMany(() => Addres, addres => addres.user)
    // addresses: Addres[];


}
