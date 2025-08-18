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
    console.log('--- INICIANDO processAuth0User ---');
    try {
      console.log(`Buscando usuario por Auth0 ID: ${auth0UserData.sub}`);
      let user = await this.findByAuth0Id(auth0UserData.sub);
      
      if (user) {
        console.log(`Usuario encontrado por Auth0 ID. ID de DB: ${user.id}`);
      } else {
        console.log('Usuario no encontrado por Auth0 ID. Buscando por email...');
        const existingUserByEmail = await this.findByEmail(auth0UserData.email);

        if (existingUserByEmail) {
          console.log(`Usuario encontrado por email. ID de DB: ${existingUserByEmail.id}. Actualizando Auth0 ID...`);
          existingUserByEmail.auth0Id = auth0UserData.sub;
          user = await this.userRepository.save(existingUserByEmail);
          console.log('Auth0 ID actualizado correctamente.');
        } else {
          console.log('Ningún usuario existente. Creando nuevo usuario...');
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
          console.log(`Nuevo usuario creado con ID de DB: ${user.id}`);
        }
      }

      if (!user.id) {
        throw new InternalServerErrorException('El usuario no tiene ID después de guardar.');
      }

      console.log('Generando token JWT...');
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const token = this.jwtService.sign(payload);
      console.log('Token JWT generado. Proceso completado exitosamente.');
      
      return { user, token };

    } catch (error) {
      console.error('--- ERROR DETECTADO DENTRO DE Auth0Service ---');
      console.error('Mensaje de Error:', error.message);
      console.error('Stack Trace:', error.stack);
      console.error('--- FIN DEL REPORTE DE ERROR EN SERVICIO ---');
      
      throw new InternalServerErrorException(`Error al procesar el usuario: ${error.message}`);
    }
  }
}
