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
    
    const oidcWithSession = req.oidc as Request['oidc'] & { session?: { app_metadata?: any } };
    
    res.json({
      auth0_profile: req.oidc.user,
      app_data: oidcWithSession.session?.app_metadata, 
    });
  }

  @Get('callback-redirect')
  handleCallbackRedirect(@Req() req: Request, @Res() res: Response) {
    const oidcWithSession = req.oidc as Request['oidc'] & { session?: { app_metadata?: any } };
    
    if (!req.oidc.isAuthenticated()) {
      return res.redirect('https://home-hero-front-cc1o.vercel.app/?error=true&message=authentication_failed');
    }

    const appMetadata = oidcWithSession.session?.app_metadata || {};
    const token = appMetadata.jwt_token || '';
    const userId = appMetadata.user_id || '';
    const userRole = appMetadata.user_role || '';
    
    // Construir URL con parámetros para redirección
    const frontendUrl = new URL('https://home-hero-front-cc1o.vercel.app/');
    frontendUrl.searchParams.set('token', token);
    frontendUrl.searchParams.set('userId', userId);
    frontendUrl.searchParams.set('userRole', userRole);
    
    console.log(`Redirigiendo explícitamente a: ${frontendUrl.toString()}`);
    
    // Realizar una redirección explícita al frontend
    return res.redirect(frontendUrl.toString());
  }
}