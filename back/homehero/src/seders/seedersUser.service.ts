import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { In, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import usersData from "./seeder.usuarios.json";
import { Role } from "src/users/assets/roles";
import { Category } from "src/category/entities/category.entity";
import { SubCategory } from "src/subcategory/entities/subcategory.entity";


@Injectable()
export class UsersServiceSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersServiceSeeder.name);
  constructor(
    @InjectRepository(User)
    private readonly UsersRepository: Repository<User>,
     @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoriesRepository: Repository<SubCategory>,
   
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('estas ejecutando seeder automatico de usuarios');
    const countUsers = await this.UsersRepository.count();
   
  if (countUsers === 0) {
      try {
        const newUsers : User[] = [];
        for (const userData of usersData) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          const userToCreate = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            birthdate: new Date(userData.birthdate), 
            dni: userData.dni,
            password: hashedPassword,
            role: userData.role as Role, // Cast explícito al enum Role
            description: userData.description || 'Sin descripción',
            imageProfile: userData.imageProfile ?? 'https://example.com/default-avatar.png',
          };
          const newUser = this.UsersRepository.create(userToCreate);
         
          newUsers.push(newUser);
        }

await this.UsersRepository.save(newUsers);
        this.logger.log('Seeder de usuarios completado.');
      } catch (error) {
        this.logger.error(`Seeder automático fallido: ${error.message}`);
      }
    } else {
        this.logger.log('La base de datos ya contiene usuarios, seeder omitido.');
    }
}
}