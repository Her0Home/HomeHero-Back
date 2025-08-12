import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { credentialsDto } from './dto/create-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('logIn')
  logIn(@Body() credentials: credentialsDto){
    return this.authService.logIn(credentials);
  }

}


console.log('hola')
