import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseUUIDPipe, Put, UseGuards, Query} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ExcludePasswordInterceptor } from 'src/interceptor/exclude-password/exclude-password.interceptor';
import { ChangeRoleInterceptor } from 'src/interceptor/change-role/change-role.interceptor';
import { Role } from './assets/roles';
import { LogginGuard } from 'src/guards/loggin.guard';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { VerifyRoleGuard } from 'src/guards/verify-role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseInterceptors(ChangeRoleInterceptor,ExcludePasswordInterceptor)
  @UseGuards(VerifyRoleGuard)
  @Post()
  create(@Body() createUserDto:CreateUserDto ) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @UseInterceptors(ExcludePasswordInterceptor)
  @Get()
  @UseGuards(LogginGuard)
  getProfesional (@Query('page') page: string, @Query('limit') limit:string){

    return this.usersService.getAllProfesional(+page, +limit);

  }

}


@Controller('user/admin')
export class adminController{
  
  constructor( private readonly userService: UsersService){}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Get()
  getAllUser(){
    return this.userService.getAllUser()
  }


  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Delete(':id')
  deleteUser(@Param('id', new ParseUUIDPipe) id:string) {
    return this.userService.DeleteUser(id);
  }


  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Get(':id')
  GetUserById(@Param('id', new ParseUUIDPipe()) id: string) {

    return this.userService.getUserById(id);

  }


  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Put('changeRole/:id')
  postRole(@Param('id', new ParseUUIDPipe()) id: string, @Body('role') newRole: Role){

    return this.userService.changeRole(id, newRole);

  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @UseInterceptors(ExcludePasswordInterceptor)
  @Get()

  verProfesionalesClientes(
  @Query('role') role: Role, 
  @Query('name') name?: string, 
  @Query('email') email?: string,
  @Query('id', new ParseUUIDPipe()) id?:string){

  }

}
