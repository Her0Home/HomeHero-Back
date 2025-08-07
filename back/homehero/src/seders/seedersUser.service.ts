import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import usersData from "./seeder.usuarios.json";


@Injectable()
export class UsersServiceSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersServiceSeeder.name);
  constructor(
    @InjectRepository(User)
    private readonly UsersRepository: Repository<User>,
   
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('estas ejecutando seeder automatico de usuarios');
    const countUsers = await this.UsersRepository.count();
   
  if (countUsers === 0) {
      try {
        const newUsers : User[] = [];
        for (const userData of usersData) {
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          const newUser = this.UsersRepository.create({
            ...userData,
            password: hashedPassword,
             imageProfile: userData.imageProfile ?? 'https://example.com/default-avatar.png',
          });
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