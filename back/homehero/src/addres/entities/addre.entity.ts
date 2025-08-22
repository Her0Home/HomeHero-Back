import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Addre {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    addres: string;

    @Column()
    streetNumber:number ; 

    @Column()
    city : string;

    @Column({nullable: true})
    aptoNumber : string; 
    
    
    @ManyToOne(()=>User, user=>user.addres)
    @JoinColumn({name: 'user_id'})
    user: User;
    
}
