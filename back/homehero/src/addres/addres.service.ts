import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAddreDto } from './dto/create-addre.dto';
import { UpdateAddreDto } from './dto/update-addre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Addre } from './entities/addre.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class AddresService {

  constructor(
    @InjectRepository(Addre) private addresRepository: Repository<Addre>,
    @InjectRepository(User) private userRepository: Repository<User>
  ){}

  async create(createAddre: CreateAddreDto, userId:string): Promise<Addre| null> {

    try {

      const foundUser: User | null = await this.userRepository.findOne({where:{id: userId}})
      if(!foundUser){
        throw new NotFoundException(`User con ID: ${userId} no fue encontrado`);
      }

      const addre: Addre =  this.addresRepository.create({...createAddre, user: foundUser})

      const saveAddre: Addre = await this.addresRepository.save(addre);

      const addreDb: Addre | null = await this.addresRepository.findOne({where:{id: saveAddre.id}});

      return addreDb;
      
    } catch (error) {
      console.log(error);
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


  async getMyAddres(id: string){

    try {
      const findUser: User | null= await this.userRepository.findOne({where:{id:id}});
      if(!findUser){
        throw new NotFoundException(`El usuario con el id ${id}, no fue encontrado`);
      }

      console.log(findUser);
      


      const addres: Addre[] = await this.addresRepository.find({where:{user:{id: findUser.id}}});


      return addres;

    } catch (error) {
      
      throw new InternalServerErrorException(`Error en el servidor, ${error}`);

    }

  }

  async deleteAddre(id: string){
    try {
      
      const result: DeleteResult = await this.addresRepository.delete(id);
      if(result.affected===0){
        throw new NotFoundException('direccion no encontrada');
      }

      return 'Direccion eliminada correctamente';

    } catch (error) {
      
    }
  }

  async getAddreById(id: string){
    try {
      const addre: Addre | null = await this.addresRepository.findOne({where:{id:id}});
      if(!addre){
        throw new NotFoundException('Dirrecion no encontrada');
      }
      return addre;

    } catch (error) {
      console.log(error);
      
    }
  }
}
