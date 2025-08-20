import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Auth0Service } from './auth0.service';

@Controller('auth0')
export class Auth0Controller {
  constructor(
    private readonly auth0Service: Auth0Service,
  ) {}

  /**
   * Endpoint protegido para que el frontend obtenga los datos del usuario
   * y un token JWT personalizado.
   * Solo es accesible si el usuario tiene una cookie de sesión válida.
   */
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // El middleware de Auth0 nos da 'req.oidc' para verificar la sesión.
    if (!req.oidc || !req.oidc.isAuthenticated()) {
      throw new UnauthorizedException('No hay una sesión de usuario activa.');
    }
    
    // Obtenemos el perfil del usuario desde la sesión de Auth0.
    const auth0Profile = req.oidc.user;
    
    // Usamos nuestro servicio para procesar al usuario (buscarlo/crearlo en nuestra DB)
    // y generar un token JWT personalizado que el frontend puede usar.
    const { token, user } = await this.auth0Service.processAuth0User(auth0Profile);

    // Devolvemos tanto el token como el perfil limpio de nuestra base de datos.
    return {
      token: token,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        imageProfile: user.imageProfile,
        needsProfileCompletion: !user.dni,
      }
    };
  }
}

