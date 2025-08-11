import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, ParseUUIDPipe, Put} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateClienteDto } from './dto/create-user.dto';
import { ExcludePasswordInterceptor } from 'src/interceptor/exclude-password/exclude-password.interceptor';
import { CreateProfesionalDto } from './dto/create-user-profesional';
import { ChangeRoleInterceptor } from 'src/interceptor/change-role/change-role.interceptor';
import { Role } from './assets/roles';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users/clientes')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}


  @UseInterceptors(ExcludePasswordInterceptor)
  @Post()
  create(@Body() createUserDto: CreateClienteDto) {
    return this.usersService.create(createUserDto);
  }

}

@Controller('user/profesional')
export class profesionalController {
  constructor(private readonly userService: UsersService){}
  
  @UseInterceptors(ChangeRoleInterceptor)
  @Post()
  createProfesional(@Body() userProfessional: CreateProfesionalDto) {
    return this.userService.createProfessional(userProfessional)
  }

}


@Controller('user/admin')
export class adminController{
  
  constructor( private readonly userService: UsersService){}
  
  @Get()
  getAllUser(){
    return this.userService.getAllUser()
  }

  @Delete()
  deleteUser(@Body('id', new ParseUUIDPipe) id:string) {
    return this.userService.DeleteUser(id);
  }

  @Get(':id')
  GetUserById(@Param('id', new ParseUUIDPipe()) id: string) {

    return this.userService.getUserById(id);

  }

  @Put('changeRole/:id')
  postRole(@Param('id', new ParseUUIDPipe()) id: string, @Body('role') newRole: Role){

    return this.userService.changeRole(id, newRole);

  }
}
