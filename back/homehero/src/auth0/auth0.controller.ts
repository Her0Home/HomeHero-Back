import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Auth0Service } from './auth0.service';

@Controller('auth0')
export class Auth0Controller {
  constructor(
    private readonly auth0Service: Auth0Service,
  ) {}

 
  @Get('profile')
  async getProfile(@Req() req: Request) {
    if (!req.oidc || !req.oidc.isAuthenticated()) {
      throw new UnauthorizedException('No hay una sesión de usuario activa.');
    }
    
    const auth0Profile = req.oidc.user;
    

    const { token, user } = await this.auth0Service.processAuth0User(auth0Profile);

    return {
      token: token,
      profile: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    };
  }
}

