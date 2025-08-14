import { Controller, Get, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Auth0Service } from './auth0.service';

@Controller('auth0')
export class Auth0Controller {
  constructor(
    private readonly auth0Service: Auth0Service,
  ) {}
  @Get('callback')
  async auth0Callback(@Req() req: Request) {
    if (!req.oidc?.user) {
      throw new UnauthorizedException('No Auth0 user data available');
    }

    const { user, token } = await this.auth0Service.processAuth0User(req.oidc.user);

    const needsProfileCompletion = user.dni;

    return {
      message: 'Authentication successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        imageProfile: user.imageProfile,
        needsProfileCompletion
      },
      token
    };
  }

  @Get('protected')
async processAuth0(@Req() req: Request) {
  
    const result = await this.auth0Service.processAuth0User(req.oidc.user);
    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role
      },
      token: result.token
    };
    }
  
}