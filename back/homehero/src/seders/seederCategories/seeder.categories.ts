import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "src/category/entities/category.entity";
import categoriesData from "./seeder.categories.json";

@Injectable()
export class CategoriesServiceSeeder {
  private readonly logger = new Logger(CategoriesServiceSeeder.name);
  
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async seed() {
    this.logger.log('Ejecutando seeder de categorías...');
    const countCategories = await this.categoriesRepository.count();
   
    if (countCategories === 0) {
      try {
        await this.categoriesRepository.save(categoriesData);
        this.logger.log(`Seeder de categorías completado: ${categoriesData.length} creadas.`);
      } catch (error) {
        this.logger.error(`Seeder de categorías fallido: ${error.message}`);
      }
    } else {
      this.logger.log('DB ya contiene categorías, seeder omitido.');
    }
  }
}