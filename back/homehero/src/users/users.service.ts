import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { CreateProfesionalDto } from './dto/create-user-profesional';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}


  async hashPassword(password: string){
    const hashPassword = await bcrypt.hash(password,10)
    return hashPassword;
  }

  async create(createUserDto: CreateClienteDto) {
    try {

      const foundUser: User | null = await this.userRepository.findOne({where:{email: createUserDto.email, dni: createUserDto.dni}});

      if(foundUser){
        throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
      }

      const {password, ...rest} = createUserDto;

      const hasPassword= await this.hashPassword(password);

      const newCliente: User = this.userRepository.create({password:hasPassword, ...rest});
      const  newUserCliente: User = await this.userRepository.save(newCliente);
      return newUserCliente;
      
    } catch (error) {
      throw new NotFoundException(`Error creating user: ${error.message}`);
    }
  }

  async createProfessional (user: CreateProfesionalDto){
    const findUser: User | null = await this.userRepository.findOne({where:{email: user.email, dni: user.dni}});
    if(findUser){
      throw new BadRequestException('Usuario ya existente con estos datos');
    }

    const {password, ...rest} = user;

    const hasPassword = await this.hashPassword(password);

    const newUserProfesional: User = this.userRepository.create({password: hasPassword, ...rest});

    const newProfesional: User = await this.userRepository.save(newUserProfesional);

    return newProfesional;

  }
  
}
