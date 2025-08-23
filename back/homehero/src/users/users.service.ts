import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { DeleteResult } from 'typeorm/browser';
import { Role } from './assets/roles';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { writeHeapSnapshot } from 'v8';
import { UpdateResult } from 'typeorm/browser';
import { ratingUserDto } from './dto/rating-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private emailService: EmailService
) {}

  async getAllUser () {

    try {

      const users: User[] | null = await this.userRepository.find();
      return users;

    } catch (error) {
      throw new BadRequestException ('Error');
    }

  }


  async deleteUser(id:string){

    try {
      const foundUser: User | null = await this.userRepository.findOne({where: {id: id}});
      console.log( typeof id);
      
      if(!foundUser){
        throw new NotFoundException('Usuario no encontrado');
      }
      
      const userRemove: DeleteResult = await this.userRepository.delete(id);
      
      if(userRemove.affected===0){
        throw new NotFoundException(`Usiario no encontrado con el id: ${id}` );
      }
      
      return 'Usuario eliminado correctamente';  
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al eliminar el user');
    }
      
      
  }


  async getUserById(id: string){

    try {
      const userFind: User | null = await this.userRepository.findOne({where:{id: id}});

      if(!userFind){
        throw new NotFoundException(`Userio no encontrado con el id: ${id} `);
      }

      return userFind;

    } catch (error) {
      
      throw new InternalServerErrorException('Error en servidor');

    }


  }


  async changeRole (id: string, newRole: Role){

    if(!Object.values(Role).includes(newRole)){
      throw new BadRequestException(`El rol ${newRole} no es valido`);
    }

    const result = await this.userRepository.update(id, {role: newRole});

    if(result.affected===0){
      throw new NotFoundException(`El usuario con el id: ${id}, no fue encontrado`);
    }

    return `El user con el id: ${id}, se modifico correctamente`

  }

  async getAllProfesional (page: number, limit: number): Promise<User[] | undefined>{

    try {

      const safePage = page && page>0 ? page: 1;
      const safeLimit = limit && limit>0? limit : 2;

      const profesionals: User[] | null = await this.userRepository.find({where:{role: Role.PROFESSIONAL, isVerified: true}})
      if(!profesionals){
        throw new InternalServerErrorException('Error al mostrar los profesionales');
      }
      
      

      const start:number = (safePage-1)*safeLimit;
      const end:number = safeLimit + start;

      const profesionales: User[] | null = profesionals.slice(start,end)

      return profesionales;
      
    } catch (error) {
      throw new InternalServerErrorException('Error al mostrar los profesionales', error);
    }

  }


  async getUserFilter(filter : {role: Role | undefined, email?: string,id?:string, name?: string, }): Promise<(User[])>{

    try {  
      const where = {isVerified: true};
      const arrayFilter = Object.entries(filter);
      arrayFilter.forEach(([key, value]) =>{

        if(!value) return

        if(key==='name'){
          where[key] = ILike(`%${value}%`);
        }else{
          where[key]= value;
        }

      });

      console.log(where);

      const users: User[] = await this.userRepository.find({where});

      return users;

              
    } catch (error) {

      throw new InternalServerErrorException('Error al buscar los usuarios', error);

    }

  }


  async banUser(id: string){
    try {
      
      const userUpdate: UpdateResult = await this.userRepository.update(id, {isActive: false});

      if(userUpdate.affected===0){
        throw new NotFoundException(`No se ha podido encontrar el usuario con id: ${id}`);
      }

      const findUser: User | null = await this.userRepository.findOne({where:{id}});

      return findUser;

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar el user')

    }
  }


  async ratingProfessionals(query: ratingUserDto){
    try {
      const {sort = 'avaregeRating', order = 'DESC'} = query;

      const validSort = ['avaregeRating','name'];  
      const sortColumn = validSort.includes(sort)? sort : 'avaregeRating';

      const sortOrder: 'ASC' | 'DESC' = order === 'ASC' ? 'ASC' : 'DESC';

      
      const [professionals, total] = await this.userRepository.findAndCount({
        where: { role: Role.PROFESSIONAL },
        order: { [sortColumn]: sortOrder },
      });

      return professionals;
    } catch (error) {
      console.log(error);
      
    }
    


  }
  
}
