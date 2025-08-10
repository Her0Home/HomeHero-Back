import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersServiceSeeder } from './seedersUser.service';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';
import { SubCategory } from 'src/subcategory/entities/subcategory.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User,Category,SubCategory])],
  controllers: [],
  providers: [UsersServiceSeeder],
})
export class SeederModule {}
