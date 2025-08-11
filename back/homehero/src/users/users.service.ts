import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { CreateProfesionalDto } from './dto/create-user-profesional';
import { DeleteResult } from 'typeorm/browser';
import { Role } from './assets/roles';
// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}


  async hashPassword(password: string){
    const hashPassword = await bcrypt.hash(password,10)
    return hashPassword;
  }

  async create(createUserDto: CreateClienteDto): Promise <User> {
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

  async createProfessional (user: CreateProfesionalDto): Promise<User>{

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

  async getAllUser () {

    try {

      const users: User[] | null = await this.userRepository.find();
      return users;

    } catch (error) {
      throw new BadRequestException ('Error');
    }

  }


  async DeleteUser(id:string){

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
      console.log('roles:',Role);
      console.log('newRole:', newRole);
      
      throw new BadRequestException(`El rol ${newRole} no es valido`);
    }

    const result = await this.userRepository.update(id, {role: newRole});

    if(result.affected===0){
      throw new NotFoundException(`El usuario con el id: ${id}, no fue encontrado`);
    }

    return `El user con el id: ${id}, se modifico correctamente`

  }
  
}
