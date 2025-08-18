import { Controller, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('auth0')
export class Auth0Controller {
  constructor() {}

  @Get('profile')
  getProfile(@Req() req: Request, @Res() res: Response) {
    if (!req.oidc.isAuthenticated()) {
      throw new UnauthorizedException('No hay una sesión de usuario activa.');
    }
    
   
    res.json({
      auth0_profile: req.oidc.user,
      app_data: (req.oidc.user as any)?.app_metadata,
    });
  }
}