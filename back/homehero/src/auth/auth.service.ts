import { Injectable, NotFoundException } from '@nestjs/common';
import { credentialsDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ResponseLoginDTO } from './dto/response-auth.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private userRepository: Repository <User>,
    private readonly jwtservice: JwtService,
     private emailService: EmailService
  ){}


  async hashPassword(password: string){
    const hashPassword = await bcrypt.hash(password,10)
    return hashPassword;
  }




  async logIn(credentials: credentialsDto): Promise<ResponseLoginDTO>{

    const findUser: User | null = await this.userRepository.findOne({where:{email: credentials.email}});

    if(!findUser){
      throw new NotFoundException('Datos invalidos');
    }

    const comparePassword = await bcrypt.compare(credentials.password, findUser.password!)

    if(!comparePassword){
      throw new NotFoundException('Datos invalidos');
    }

    const payload ={
      id: findUser.id,
      email: findUser.email,
      role: findUser.role,
      dni: findUser.dni,
    }

    const user = {
      isActive: findUser.isActive,
      
      isVerified: findUser.isVerified,
      
      role: findUser.role,
      
      id: findUser.id,
      
      name: findUser.name,

      isMembresyActive: findUser.isMembresyActive
    }

    const token = this.jwtservice.sign(payload);
    return { message: 'Login successful', token: token, user:user};
  }



   async create(createUserDto: CreateUserDto): Promise <User> {
      try {
  
        const foundUser: User | null = await this.userRepository.findOne({where:{email: createUserDto.email, dni: createUserDto.dni}});
  
        if(foundUser){
          throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
        }
  
        const {password, ...rest} = createUserDto;
  
        const hasPassword= await this.hashPassword(password);
  
        const newCliente: User = this.userRepository.create({password:hasPassword, ...rest});
        const  newUserCliente: User = await this.userRepository.save(newCliente);
  
        await this.emailService.sendEmailCreate(newCliente.email, newCliente.name)
  
        console.log(newUserCliente);
        
  
        return newUserCliente;
        
      } catch (error) {
        console.log(error);
        
        throw new NotFoundException(`Error creating user!!: ${error.message}`, error );
      }
    }

}
