import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }
  @Get()
  handleRoot(@Req() req: Request, @Res() res: Response) {
    if (req.oidc && req.oidc.isAuthenticated()) {
      // ¡Punto clave! Redirigir a una ruta específica en el frontend.
      // El frontend se encargará de llamar a /auth0/profile para obtener el token.
      res.redirect('https://home-hero-front-cc1o.vercel.app/auth/callback');
    } else {
      // Si no está autenticado, puede mostrar "Hello World!" o redirigir a la página de login del frontend.
      res.send(this.appService.getHello());
    }
  }
}

