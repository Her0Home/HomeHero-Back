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
   res.redirect('http://localhost:3000/callback');
  } else {
    res.send(this.appService.getHello());
  }
}
}

