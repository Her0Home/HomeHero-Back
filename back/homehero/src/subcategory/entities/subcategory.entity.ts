import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';

@Entity('subcategories')
export class SubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'text'})
  image: string;

  @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: 'CASCADE' })
  category: Category;
}