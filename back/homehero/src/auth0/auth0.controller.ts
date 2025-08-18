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
  @Get('finish')
  finishAuth(@Req() req: Request, @Res() res: Response) {
    const oidcWithSession = req.oidc as typeof req.oidc & { session?: { finalRedirectUrl?: string } };
    const finalRedirectUrl = oidcWithSession.session?.finalRedirectUrl;
    if (finalRedirectUrl) {
      delete oidcWithSession.session?.finalRedirectUrl;
      return res.redirect(finalRedirectUrl);
    }
    return res.redirect('https://home-hero-front-cc1o.vercel.app/');
  }
}