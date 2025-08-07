import { User } from "src/users/entities/user.entity";
import { Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Addre {

    @PrimaryGeneratedColumn('uuid')
    id:string;

    addres: string;

    @ManyToMany(()=>User, user=>user.addres)
    user: User[];
    
}
