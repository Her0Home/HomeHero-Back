import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async create(createUserDto: CreateClienteDto) {
    try {

      const foundUser: User | null = await this.userRepository.findOne({where:{email: createUserDto.email}});

      if(foundUser){
        throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
      }


      const newCliente: User = this.userRepository.create(createUserDto);
      const  newUserCliente: User = await this.userRepository.save(newCliente);
      return newUserCliente;
      
    } catch (error) {
      throw new NotFoundException(`Error creating user: ${error.message}`);
    }
  }
  
}
