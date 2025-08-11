import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "src/category/entities/category.entity";
import categoriesData from "./seeder.categories.json";

@Injectable()
export class CategoriesServiceSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(CategoriesServiceSeeder.name);
  
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Ejecutando seeder automático de categorías');
    const countCategories = await this.categoriesRepository.count();
   
    if (countCategories === 0) {
      try {
        const newCategories: Category[] = [];
        
        for (const categoryData of categoriesData) {
          const categoryToCreate = {
            name: categoryData.name,
            subCategoryArray: categoryData.subCategoryArray
          };
          
          const newCategory = this.categoriesRepository.create(categoryToCreate);
          newCategories.push(newCategory);
        }

        await this.categoriesRepository.save(newCategories);
        this.logger.log(`Seeder de categorías completado. Se crearon ${newCategories.length} categorías.`);
      } catch (error) {
        this.logger.error(`Seeder automático de categorías fallido: ${error.message}`);
        this.logger.error(error.stack);
      }
    } else {
      this.logger.log('La base de datos ya contiene categorías, seeder omitido.');
    }
  }
}