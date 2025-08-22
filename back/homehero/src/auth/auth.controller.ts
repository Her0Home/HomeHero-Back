import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { credentialsDto } from './dto/create-auth.dto';
import { VerifyRoleGuard } from 'src/guards/verify-role.guard';
import { ExcludePasswordInterceptor } from 'src/interceptor/exclude-password/exclude-password.interceptor';
import { ChangeRoleInterceptor } from 'src/interceptor/change-role/change-role.interceptor';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('logIn')
  logIn(@Body() credentials: credentialsDto){
    return this.authService.logIn(credentials);
  }

  @ApiBearerAuth()
  @UseInterceptors(ChangeRoleInterceptor,ExcludePasswordInterceptor)
  @UseGuards(VerifyRoleGuard)
  @Post('register')
  create(@Body() createUserDto:CreateUserDto ) {
    return this.authService.create(createUserDto);
  }

}



