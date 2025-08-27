import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { AddresService } from './addres.service';
import { CreateAddreDto } from './dto/create-addre.dto';
import { UpdateAddreDto } from './dto/update-addre.dto';
import { LogginGuard } from 'src/guards/loggin.guard';
import { Role } from 'src/users/assets/roles';
import { Roles } from 'src/decorators/role.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('addres')
export class AddresController {
  constructor(private readonly addresService: AddresService) {}

  @UseGuards(LogginGuard)
  @Post(':id')
  create(@Body() createAddreDto: CreateAddreDto, @Param('id') userId: string ) {
    return this.addresService.create(createAddreDto,userId);
  }

  @UseGuards(LogginGuard)
  @Get(':id/myaddres')
  getMyAdrres(@Param('id', new ParseUUIDPipe()) id: string){

    return this.addresService.getMyAddres(id)

  }

  @UseGuards(LogginGuard)
  @Delete(':id')
  delete(@Param('id', new ParseUUIDPipe()) id: string){
    return this.addresService.deleteAddre(id);
  }


  @UseGuards(LogginGuard)
  @Get(':id')
  getAddreById(@Param('id', new ParseUUIDPipe()) id: string){

    return this.addresService.getAddreById(id)

  }



  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
  @Get()
  getAllAddres(){
    return this.addresService.getAllAddres()
  }
}
