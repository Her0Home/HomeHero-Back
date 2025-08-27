import { Module } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { SubcategoryController } from './subcategory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategory } from './entities/subcategory.entity';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports:[TypeOrmModule.forFeature([SubCategory]), CategoryModule],
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
  exports:[SubcategoryService]
})
export class SubcategoryModule {}
