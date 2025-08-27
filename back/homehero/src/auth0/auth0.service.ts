import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/assets/roles';

@Injectable()
export class Auth0Service {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  private async findByAuth0Id(auth0Id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { auth0Id } });
  }

  private async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async processAuth0User(
    auth0UserData: any,
  ): Promise<{ user: User; token: string }> {
    try {
      let user = await this.findByAuth0Id(auth0UserData.sub);
      
      if (user) {
      
      } else {

        const existingUserByEmail = await this.findByEmail(auth0UserData.email);

        if (existingUserByEmail) {
          existingUserByEmail.auth0Id = auth0UserData.sub;
          user = await this.userRepository.save(existingUserByEmail);
        } else {
         
          const newUser = this.userRepository.create({
            auth0Id: auth0UserData.sub,
            name: auth0UserData.name || 'User',
            email: auth0UserData.email,
            imageProfile: auth0UserData.picture,
            metadata: auth0UserData,
            isActive: true,
            isVerified:  false,
            role: Role.UNKNOWN,
          });
          user = await this.userRepository.save(newUser);
       
        }
      }

      if (!user.id) {
        throw new InternalServerErrorException('El usuario no tiene ID después de guardar.');
      }


      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const token = this.jwtService.sign(payload);
     
      
      return { user, token };

    } catch (error) {
      
      
      throw new InternalServerErrorException(`Error al procesar el usuario: ${error.message}`);
    }
  }
} 
