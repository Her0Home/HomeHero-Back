import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseUUIDPipe, Put, UseGuards, Query, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ExcludePasswordInterceptor } from 'src/interceptor/exclude-password/exclude-password.interceptor';
import { ChangeRoleInterceptor } from 'src/interceptor/change-role/change-role.interceptor';
import { Role } from './assets/roles';
import { LogginGuard } from 'src/guards/loggin.guard';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { VerifyRoleGuard } from 'src/guards/verify-role.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { Email } from 'src/email/entities/email.entity';
import { filter } from 'rxjs';
import { ratingUserDto } from './dto/rating-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseInterceptors(ExcludePasswordInterceptor)
  @UseGuards(LogginGuard)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 3 })
  @Get('professionals')  
  getProfesionals (@Query('page') page: string = '1', @Query('limit') limit:string = '3'){

    return this.usersService.getAllProfesional(+page, +limit);

  }

  @ApiBearerAuth()
  @UseInterceptors(ExcludePasswordInterceptor)
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 3 })
  @Get('search')
  getAllUserVerifi(
    @Query('role') role?: Role | undefined,
    @Query('email') email?: string,
    @Query('id', new ParseUUIDPipe({optional: true})) id?: string,
    @Query('name') name? : string
  ){
    return this.usersService.getUserFilter({role, email, id, name})
  }

  @ApiBearerAuth()
  @UseGuards(LogginGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Get(':id')
  GetUserById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.getUserById(id);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Get()
  getAllUser(){
    return this.usersService.getAllUser()
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Delete(':id')
  deleteUser(@Param('id', new ParseUUIDPipe) id:string) {
    return this.usersService.deleteUser(id);
  }

  @ApiBearerAuth()
  @UseInterceptors(ExcludePasswordInterceptor)
  @Put(':id/role')
  putRole(@Param('id', new ParseUUIDPipe()) id: string, @Body('role') newRole: Role){
  
    return this.usersService.changeRole(id, newRole);
  
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @Put(':id/ban')
  banUser (@Param('id', new ParseUUIDPipe()) id:string){
    return this.usersService.banUser(id);
  }


    @Get('rating/professionals')
    getByRating(@Query() query: ratingUserDto){
      return this.usersService.ratingProfessionals(query)
    }

}

