import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddresService } from './addres.service';
import { CreateAddreDto } from './dto/create-addre.dto';
import { UpdateAddreDto } from './dto/update-addre.dto';

@Controller('addres')
export class AddresController {
  constructor(private readonly addresService: AddresService) {}

  @Post(':id')
  create(@Body() createAddreDto: CreateAddreDto[], @Param('id') userId: string ) {
    return this.addresService.create(createAddreDto,userId);
  }

  @Get()
  getAllAddres(){
    return this.addresService.getAllAddres()
  }
}
