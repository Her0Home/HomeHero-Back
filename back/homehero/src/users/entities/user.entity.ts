import { Appointment } from "src/appointment/entities/appointment.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../assets/roles";
import { Membership } from "src/membership/entities/membership.entity";
import { Addre } from "src/addres/entities/addre.entity";
import { SubCategory } from "src/subcategory/entities/subcategory.entity";
import { Category } from "src/category/entities/category.entity";
import { Image } from "src/images/entities/image.entity";
import { Chat } from "src/chat/entities/chat.entity";
import { Payment } from "src/stripe/entities/stripe.entity";

@Entity({name: 'users'})
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: true })
    auth0Id?: string;

    @Column({type:'varchar'})
    name: string;

    @Column({type:'varchar', unique: true})
    email: string;

    @Column({type:'date',nullable: true})
    birthdate?: Date;

    @Column({type:'bigint', unique: true, nullable: true})
    dni?: number;

    
    @Column({type:'varchar',nullable: true})
    imageProfile?:string;

    @Column({type:'varchar', default:'Sin descripción',nullable: true})
    description?: string;

    @Column({type:'varchar',nullable: true})
    password?: string;

    @Column({type:'decimal', precision: 10, scale: 1, default: 0,nullable: true})
    avaregeRating?: number;

    @Column({type:'integer', default: 0,nullable: true})
    totalAppointments?: number;
    
    
    @Column({type:'boolean', default: false,})
    isVerified?: boolean;

    @Column({type:'boolean', default: false,})
    isMembresyActive?: boolean;

    @Column({type:'boolean', default: true})
    isActive?: boolean;
    
    @Column({type:'enum', enum: Role, default:Role.UNKNOWN})
    role?: Role;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: any;
     
    @Column({ nullable: true })
    stripeCustomerId?: string;

    @OneToMany(() => Appointment, appoiment=> appoiment.client)
    clientAppointments?: Appointment[];
    
    @OneToMany(()=>Appointment, appoiment=> appoiment.professional,{cascade: true, onDelete: 'CASCADE'})
    professionalAppointments?: Appointment[];
    
    
    @OneToOne(()=> Membership, membership => membership.user,{cascade: true, onDelete: 'CASCADE'})
    membership?: Membership;

    @ManyToMany(()=>Category, category=>category.professional,{cascade: true})
    @JoinTable({name:'professional_category'})
    categories?: Category[];
    
    

     @OneToMany(() => Payment, payment => payment.user)
     payments?: Payment[];

    @ManyToMany(() => SubCategory, subcategory => subcategory.professionals,{cascade: true})
    @JoinTable({name: 'professional_subcategories'})
    subcategories?: SubCategory[];
    
    @OneToMany(()=> Addre, addre=> addre.user,{cascade: true, onDelete: 'CASCADE'})
    @JoinColumn({name:'addres_id'})
    addres?: Addre[]
    // @OneToMany(() => Addres, addres => addres.user)
    // addresses: Addres[];

    // @ManyToMany(() => Subcategories, subcategory => subcategory.users)
    // subcategories?: Subcategories[];
    @OneToMany(() => Image, image => image.user)
    @JoinColumn({ name: 'image_id' })
    image?: Image[];

    @OneToMany(() => Chat, (chat) => chat.cliente)
    clientChats?: Chat[];

    @OneToMany(() => Chat, (chat) => chat.profesional)
    profesionalChats?: Chat[];

}
