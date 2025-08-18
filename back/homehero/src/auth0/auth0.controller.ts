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
  @Get('redirect')
  handleRedirect(@Req() req: Request, @Res() res: Response) {
    const frontendUrl = 'https://home-hero-front-cc1o.vercel.app/';
    const sessionData = (req.oidc as any)?.app_metadata;

    if (!sessionData) {
      const errorParams = new URLSearchParams({ error: 'true', message: 'session_data_missing' }).toString();
      return res.redirect(`${frontendUrl}?${errorParams}`);
    }


    if (sessionData.error) {
       const errorParams = new URLSearchParams({ error: 'true', message: sessionData.error }).toString();
       return res.redirect(`${frontendUrl}?${errorParams}`);
    }


    const successParams = new URLSearchParams();
    successParams.append('token', sessionData.jwt_token);
    successParams.append('needsProfileCompletion', String(sessionData.needs_profile_completion));
    successParams.append('userName', sessionData.user_name);


    delete ((req.oidc as any).session?.app_metadata);

    return res.redirect(`${frontendUrl}?${successParams.toString()}`);
  }
}

