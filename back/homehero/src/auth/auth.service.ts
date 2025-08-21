import { Injectable, NotFoundException } from '@nestjs/common';
import { credentialsDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ResponseLoginDTO } from './dto/response-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User) private userRepository: Repository <User>,
    private readonly jwtservice: JwtService
  ){}


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
    }

    const token = this.jwtservice.sign(payload);
    return { message: 'Login successful', token: token, user:user};
  }

}
