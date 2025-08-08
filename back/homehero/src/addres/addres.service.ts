import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddreDto } from './dto/create-addre.dto';
import { UpdateAddreDto } from './dto/update-addre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Addre } from './entities/addre.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AddresService {

  constructor(
    @InjectRepository(Addre) private addresRepository: Repository<Addre>,
    @InjectRepository(User) private userRepository: Repository<User>
  ){}

  async create(createAddre: CreateAddreDto[], userId:string): Promise<Addre[]> {

    try {

      const foundUser: User | null = await this.userRepository.findOne({where:{id: userId}})
      if(!foundUser){
        throw new NotFoundException(`User con ID: ${userId} no fue encontrado`);
      }

      const addres: Addre[] = createAddre.map(addre => 
        this.addresRepository.create({addres: addre.addres, user: foundUser})
      );

      const newsAddres: Addre[] | null = await this.addresRepository.save(addres);

      return newsAddres;

      
    } catch (error) {
      throw new ExceptionsHandler(error.message);
    }

  }


  async getAllAddres(){
    try {
      
      const addres: Addre[] | null = await this.addresRepository.find({relations:['user'], select: {
        user:{
          name: true,
          email: true,
          dni: true,
        }
      }});
      return addres 

    } catch (error) {
        throw new BadRequestException('Error al mostrar las direcciones');
    }
  }
}
