import { SubCategory } from 'src/subcategory/entities/subcategory.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
  subcategories: SubCategory[];

  @OneToMany(()=>User, user=>user.category)
  professional: User[];
}

