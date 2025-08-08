import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    console.log('BODY:', createCategoryDto);
    return this.categoryService.create(createCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
