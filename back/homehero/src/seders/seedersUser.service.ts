import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { In, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import usersData from "./seeder.usuarios.json";
import { Role } from "src/users/assets/roles";
import { Category } from "src/category/entities/category.entity";
import { SubCategory } from "src/subcategory/entities/subcategory.entity";
import { CategoriesServiceSeeder } from "../seders/seederCategories/seeder.categories";
import { SubcategoriesServiceSeeder } from "../seders/seederSubcategories/seeder.subcategories";

@Injectable()
export class UsersServiceSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersServiceSeeder.name);
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoriesRepository: Repository<SubCategory>,
    private readonly categoriesSeeder: CategoriesServiceSeeder,
    private readonly subcategoriesSeeder: SubcategoriesServiceSeeder,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Iniciando proceso de seeder orquestado...');
    
    await this.categoriesSeeder.seed();
    await this.subcategoriesSeeder.seed();

    this.logger.log('Ejecutando seeder de usuarios...');
    const countUsers = await this.usersRepository.count();

    if (countUsers > 0) {
      this.logger.log('DB ya contiene usuarios, seeder omitido.');
      return;
    }
    
    try {
      for (const userData of usersData as any[]) { 
        if (!userData.role) continue;
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const userToCreate = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          birthdate: new Date(userData.birthdate),
          dni: userData.dni,
          password: hashedPassword,
          role: userData.role as Role,
          description: userData.description,
          imageProfile: userData.imageProfile,
        };
        const newUser = this.usersRepository.create(userToCreate);

        if (userData.role === Role.PROFESSIONAL) {
        
            const categoryId = userData.categoryId || userData.categoryIds;

            if (categoryId && typeof categoryId === 'string') {

              const category = await this.categoriesRepository.findOneBy({ id: categoryId });
              if (category) {
         
                (newUser as any).category = category;
              } else {
                this.logger.warn(`Categoría con ID '${categoryId}' no encontrada para el usuario '${userData.name}'`);
              }
            }

            const subCategoryIds = userData.subCategoryIds;
            if (subCategoryIds && Array.isArray(subCategoryIds) && subCategoryIds.length > 0 && subCategoryIds[0]) {
              const subcategories = await this.subCategoriesRepository.findBy({ id: In(subCategoryIds) });
              if (subcategories.length > 0) {
                newUser.subcategories = subcategories;
              }
            }
        }
        await this.usersRepository.save(newUser);
      }
      this.logger.log('Seeder de usuarios y relaciones completado.');
    } catch (error) {
      this.logger.error(`Seeder de usuarios fallido: ${error.message}`);
    }
  }
}