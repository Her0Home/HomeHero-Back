import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
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

  async findByAuth0Id(auth0Id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { auth0Id } });
  }
  
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
  async processAuth0User(auth0UserData: any): Promise<{ user: User, token: string }> {
  console.log('Procesando usuario Auth0:', JSON.stringify(auth0UserData));
  try {
    let user = await this.findByAuth0Id(auth0UserData.sub);
    
    if (!user) {

      const existingUserByEmail = await this.findByEmail(auth0UserData.email);
   
      
      if (existingUserByEmail) {
        existingUserByEmail.auth0Id = auth0UserData.sub;
        existingUserByEmail.metadata = auth0UserData;
        existingUserByEmail.isVerified = auth0UserData.email_verified || existingUserByEmail.isVerified;
        
        try {
          user = await this.userRepository.save(existingUserByEmail);
    
        } catch (saveError) {
      
          throw saveError;
        }
      } else {
       

        const newUser = this.userRepository.create({
          auth0Id: auth0UserData.sub,
          name: auth0UserData.name || 'User',
          email: auth0UserData.email,
          imageProfile: auth0UserData.picture,
          metadata: auth0UserData,
          isActive: true,
          isVerified: auth0UserData.email_verified || false,
          role: Role.CLIENTE,
        });
        
        try {
          user = await this.userRepository.save(newUser);
          
        } catch (saveError) {
          throw saveError;
        }
      }
    } else {
      user.name = auth0UserData.name || user.name;
      user.email = auth0UserData.email || user.email;
      user.imageProfile = auth0UserData.picture || user.imageProfile;
      user.isVerified = auth0UserData.email_verified || user.isVerified;
      user.metadata = auth0UserData;
      
      try {
        user = await this.userRepository.save(user);
      } catch (saveError) {
        throw saveError;
      }
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      dni: user.dni,
    };
    
    const token = this.jwtService.sign(payload);
    
    return { user, token };
  } catch (error) {
    console.error('Error en processAuth0User:', error);
    if (error.code === '23505') { 
      throw new ConflictException('User with this email or DNI already exists');
    }
    throw new InternalServerErrorException(`Error processing Auth0 user: ${error.message}`);
  }
}
}