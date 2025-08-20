import { Controller, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
// ¡CORREGIDO! Se añade 'type' para cumplir con las reglas de TypeScript.
import type { Request, Response } from 'express';
import { Auth0Service } from './auth0.service';

@Controller('auth0')
export class Auth0Controller {
  constructor(
    private readonly auth0Service: Auth0Service,
  ) {}

  /**
   * Este endpoint es el destino final después de que el middleware de Auth0
   * ha procesado exitosamente el callback y ha creado la sesión.
   * Su única responsabilidad es redirigir al usuario al frontend.
   */
  @Get('redirect-to-front')
  redirectToFront(@Res() res: Response) {
    // Ahora que la sesión está garantizada, redirigimos al frontend.
    res.redirect('https://home-hero-front-cc1o.vercel.app');
  }

  /**
   * Endpoint protegido para que el frontend obtenga los datos del usuario
   * y un token JWT personalizado.
   * Solo es accesible si el usuario tiene una cookie de sesión válida.
   */
  @Get('profile')
  async getProfile(@Req() req: Request) {
    // El middleware de Auth0 nos da 'req.oidc' para verificar la sesión.
    if (!req.oidc.isAuthenticated()) {
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
