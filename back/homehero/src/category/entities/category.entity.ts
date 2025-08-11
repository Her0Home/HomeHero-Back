import { SubCategory } from 'src/subcategory/entities/subcategory.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('categorias')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column("simple-array")
  subCategoryArray: string[];

  @Column({nullable: true})// Para la precarga de categorias luego se le asigna un usuario a esa categoria//
  users_id: number;

  @OneToMany(() => SubCategory, (subcategory) => subcategory.category)
  subcategories: SubCategory[];

  @ManyToMany(()=>User, user=>user.categories)
  professional: User[];
  category: Category;
}

