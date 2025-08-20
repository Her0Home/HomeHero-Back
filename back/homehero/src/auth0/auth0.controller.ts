import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import express from 'express';
import { Auth0Service } from './auth0.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { LogginGuard } from 'src/guards/loggin.guard';

@Controller('auth0')
export class Auth0Controller {
  constructor(
    private readonly auth0Service: Auth0Service,
    private readonly configService: ConfigService, // Necesitas esto para las variables de entorno
  ) {}

  @Post('callback')
  async handleCallback(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    if (!code) {
      throw new UnauthorizedException('No se proporcionó un código de autorización.');
    }

    try {
  
      const tokenResponse = await axios.post(
        `https://${this.configService.get<string>('AUTH0_ISSUER_BASE_URL')}/oauth/token`,
        {
          grant_type: 'authorization_code',
          client_id: this.configService.get<string>('AUTH0_CLIENT_ID'),
          client_secret: this.configService.get<string>('AUTH0_CLIENT_SECRET'),
          code: code,
          redirect_uri: 'https://home-hero-front-cc1o.vercel.app/callback',
        },
      );

 
      const { id_token } = tokenResponse.data;
      const auth0UserData = jwtDecode(id_token);



      const { user, token } = await this.auth0Service.processAuth0User(
        auth0UserData,
      );


      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 1 día
      });


      return {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          imageProfile: user.imageProfile,
          needsProfileCompletion: !user.dni,
        },
      };
    } catch (error) {
        console.error('Error en el callback de Auth0:', error.response?.data || error.message);
        throw new UnauthorizedException('Falló el procesamiento de la autenticación.');
    }
  }

  @Get('profile')
  @UseGuards(LogginGuard) 
  getProfile(@Req() req: express.Request) {

    return req.user;
  }
}