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
      console.log('Procesando usuario Auth0:', JSON.stringify(auth0UserData));

      let user = await this.findByAuth0Id(auth0UserData.sub);

      if (!user) {
        const existingUserByEmail = await this.findByEmail(auth0UserData.email);

        if (existingUserByEmail) {
<<<<<<< HEAD
          // Usuario existe, lo vinculamos
          existingUserByEmail.auth0Id = auth0UserData.sub;
          user = await this.userRepository.save(existingUserByEmail);
        } else {
          // Usuario es nuevo, lo creamos
=======
          existingUserByEmail.auth0Id = auth0UserData.sub;
          user = await this.userRepository.save(existingUserByEmail);
        } else {
>>>>>>> 7714122d5c7f9b10df29ff85ec05898e661df438
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
          user = await this.userRepository.save(newUser);
        }
      } else {
<<<<<<< HEAD
        // Usuario ya existía, lo actualizamos
=======
>>>>>>> 7714122d5c7f9b10df29ff85ec05898e661df438
        user.name = auth0UserData.name || user.name;
        user.imageProfile = auth0UserData.picture || user.imageProfile;
        user.metadata = auth0UserData;
        await this.userRepository.save(user);
      }

<<<<<<< HEAD
      // ✅ CORRECCIÓN: Nos aseguramos de que el 'user' tenga un ID antes de firmar el token.
=======
>>>>>>> 7714122d5c7f9b10df29ff85ec05898e661df438
      if (!user || !user.id) {
        throw new InternalServerErrorException(
          'El usuario no se pudo guardar o no tiene ID.',
        );
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const token = this.jwtService.sign(payload);
      return { user, token };
    } catch (error) {
<<<<<<< HEAD
      console.error('💥 ERROR DETALLADO en processAuth0User:', error);
=======
      console.error('error', error);
>>>>>>> 7714122d5c7f9b10df29ff85ec05898e661df438
      if (error.code === '23505') {
        throw new ConflictException('El usuario con este email ya existe.');
      }
      throw new InternalServerErrorException(
        `Error al procesar el usuario: ${error.message}`,
      );
    }
  }
}