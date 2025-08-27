import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersServiceSeeder } from './seedersUser.service';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { SubCategory } from 'src/subcategory/entities/subcategory.entity';
import { SubcategoriesServiceSeeder } from './seederSubcategories/seeder.subcategories';
import { CategoriesServiceSeeder } from './seederCategories/seeder.categories';
import { Addre } from 'src/addres/entities/addre.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User,Category,SubCategory, Addre])],
  controllers: [],
  providers: [UsersServiceSeeder,  CategoriesServiceSeeder,SubcategoriesServiceSeeder],
})
export class SeederModule {}
