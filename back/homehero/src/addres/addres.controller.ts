import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AddresService } from './addres.service';
import { CreateAddreDto } from './dto/create-addre.dto';
import { UpdateAddreDto } from './dto/update-addre.dto';

@Controller('addres')
export class AddresController {
  constructor(private readonly addresService: AddresService) {}

  @Post()
  create(@Body() createAddreDto: CreateAddreDto) {
    return this.addresService.create(createAddreDto);
  }

  @Get()
  findAll() {
    return this.addresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAddreDto: UpdateAddreDto) {
    return this.addresService.update(+id, updateAddreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.addresService.remove(+id);
  }
}
