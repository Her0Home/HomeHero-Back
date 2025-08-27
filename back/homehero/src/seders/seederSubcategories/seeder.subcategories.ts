import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "src/category/entities/category.entity";
import { SubCategory } from "src/subcategory/entities/subcategory.entity";
import subcategoriesData from "./seeder.subcategoris.json";

@Injectable()
export class SubcategoriesServiceSeeder {
  private readonly logger = new Logger(SubcategoriesServiceSeeder.name);
  
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoriesRepository: Repository<SubCategory>,
  ) {}

  async seed() {
    this.logger.log('Ejecutando seeder de subcategorías...');
    const countSubcategories = await this.subCategoriesRepository.count();
   
    if (countSubcategories === 0) {
      try {
        const newSubcategories: SubCategory[] = [];
        for (const subcategoryData of subcategoriesData) {
          const category = await this.categoriesRepository.findOneBy({ id: subcategoryData.categoryId });
          if (!category) {
            this.logger.warn(`Categoría con ID '${subcategoryData.categoryId}' no encontrada.`);
            continue;
          }
          const subCategoryToCreate = {
            id: subcategoryData.id,
            name: subcategoryData.name,
            category: category
          };
          newSubcategories.push(this.subCategoriesRepository.create(subCategoryToCreate));
        }

        if (newSubcategories.length > 0) {
            await this.subCategoriesRepository.save(newSubcategories);
            this.logger.log(`Seeder de subcategorías completado: ${newSubcategories.length} creadas.`);
        }
      } catch (error) {
        this.logger.error(`Seeder de subcategorías fallido: ${error.message}`);
      }
    } else {
      this.logger.log('DB ya contiene subcategorías, seeder omitido.');
    }
  }
}
