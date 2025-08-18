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
    
    // Extendemos el tipo de req.oidc para acceder a la sesión de forma segura
    const oidcWithSession = req.oidc as Request['oidc'] & { session?: { app_metadata?: any } };
    
    res.json({
      auth0_profile: req.oidc.user,
      app_data: oidcWithSession.session?.app_metadata, 
    });
  }

  @Get('finish')
  finishAuth(@Req() req: Request, @Res() res: Response) {
    const oidcWithSession = req.oidc as Request['oidc'] & { session?: { finalRedirectUrl?: string } };
    const finalRedirectUrl = oidcWithSession.session?.finalRedirectUrl;
    
    if (finalRedirectUrl) {
      // Limpiamos la URL de la sesión para que no se reutilice
      delete oidcWithSession.session?.finalRedirectUrl;
      return res.redirect(finalRedirectUrl);
    }
    
    // Si por alguna razón no hay URL, redirigimos a la página principal del frontend
    return res.redirect('https://home-hero-front-cc1o.vercel.app/');
  }
}