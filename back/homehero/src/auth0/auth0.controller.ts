import { Controller, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Auth0Service } from './auth0.service';

@Controller('auth0')
export class Auth0Controller {
  constructor(private readonly auth0Service: Auth0Service) {}

 @Get('google')
loginWithGoogle(@Req() req: Request, @Res() res: Response) {
  console.log('Iniciando login con Google...');
  
  // Redirección directa a Auth0 con conexión Google
  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const redirectUri = encodeURIComponent('http://localhost:3000/auth0/callback');
  const url = `${auth0Domain}/authorize?client_id=${clientId}&response_type=code&scope=openid%20profile%20email&redirect_uri=${redirectUri}&connection=google-oauth2`;
  
  return res.redirect(url);
}

 
  @Get('callback')
async auth0Callback(@Req() req: Request) {
  console.log('Callback recibido, datos de req.oidc:', JSON.stringify({
    isAuthenticated: req.oidc?.isAuthenticated,
    userExists: !!req.oidc?.user,
    user: req.oidc?.user
  }));

  if (!req.oidc?.user) {
    console.error('No se encontraron datos de usuario de Auth0');
    throw new UnauthorizedException('No se encontraron datos de usuario de Auth0');
  }

  const { user, token } = await this.auth0Service.processAuth0User(
    req.oidc.user,
  );

  return {
    message: 'Authentication successful',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      imageProfile: user.imageProfile,
      needsProfileCompletion: !user.dni,
    },
    token,
  };
}
  
  @Get('protected')
  async processAuth0(@Req() req: Request) {
    if (!req.oidc?.user) {
      throw new UnauthorizedException('No hay una sesión de Auth0 activa.');
    }
    
    const result = await this.auth0Service.processAuth0User(req.oidc.user);
    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
      token: result.token,
    };
  }
}