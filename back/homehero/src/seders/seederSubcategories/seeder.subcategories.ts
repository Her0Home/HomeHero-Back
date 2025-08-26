import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Category } from "src/category/entities/category.entity";
import { SubCategory } from "src/subcategory/entities/subcategory.entity";
import subcategoriesData from "./seeder.subcategoris.json";

@Injectable()
export class SubcategoriesServiceSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(SubcategoriesServiceSeeder.name);
  
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoriesRepository: Repository<SubCategory>,
  ) {}

  async onApplicationBootstrap() {
   
    this.logger.log('Esperando 1.5 segundos para dar tiempo al seeder de categorías...');
    await new Promise(res => setTimeout(res, 1500)); 
  

    this.logger.log('Ejecutando seeder automático de subcategorías');
    const countSubcategories = await this.subCategoriesRepository.count();
   
    if (countSubcategories === 0) {
      try {
        const categories = await this.categoriesRepository.find();
        
        if (categories.length === 0) {
          console.log(categories.length);
          this.logger.warn('Aún no hay categorías en la base de datos después de esperar. Revisa el seeder de categorías.');
          return;
        }

        const newSubcategories: SubCategory[] = [];
        
        for (const subcategoryData of subcategoriesData) {
          const category = categories.find(cat => cat.name === subcategoryData.categoryName);
          
          if (!category) {
            this.logger.warn(`Categoría con nombre '${subcategoryData.categoryName}' no encontrada para la subcategoría '${subcategoryData.name}'`);
            continue;
          }

          const subCategoryToCreate = {
            name: subcategoryData.name,
            category: category
          };
          
          const newSubcategory = this.subCategoriesRepository.create(subCategoryToCreate);
          newSubcategories.push(newSubcategory);
        }

        if (newSubcategories.length > 0) {
            await this.subCategoriesRepository.save(newSubcategories);
            this.logger.log(`Seeder de subcategorías completado. Se crearon ${newSubcategories.length} subcategorías.`);
        } else {
            this.logger.log('No se crearon nuevas subcategorías (quizás los nombres no coinciden).');
        }

      } catch (error) {
        this.logger.error(`Seeder automático de subcategorías fallido: ${error.message}`);
      }
    } else {
      this.logger.log('La base de datos ya contiene subcategorías, seeder omitido.');
    }
  }
}