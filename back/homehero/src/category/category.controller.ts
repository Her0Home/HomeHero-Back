import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req, ParseUUIDPipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiParam } from '@nestjs/swagger';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('name')
  async getCategoryByName(@Query('category') category: string){
    return this.categoryService.findCategoryName(category);
  }
  
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID de la categoría en formato UUID',
    example: 'd16cf338-af25-45a6-a5c3-da3d371645df  ',
  })
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.findOne(id);
  }
}
