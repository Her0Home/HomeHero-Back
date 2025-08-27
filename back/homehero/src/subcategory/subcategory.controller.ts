import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { SubcategoryService } from './subcategory.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Get('all')
  findAll() {
    return this.subcategoryService.getAll();
  }

  @Get(':id/subcategory')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subcategoryService.getSubCategorieById(id);
  }

  @Post()
  update(@Body() body: CreateSubcategoryDto) {
    return this.subcategoryService.create(body);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.subcategoryService.remove(+id);
  }
}
