import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Req, ParseUUIDPipe, Query } from '@nestjs/common';
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

  @Get('name')
  async getCategoryByName(@Query('category') category: string){
    return this.categoryService.findCategoryName(category);
  }
  
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.categoryService.findOne(id);
  }


  // @Put(':id')
  // async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
  //   return this.categoryService.update(+id, updateCategoryDto);
  // }

  // @Post()
  // async create(@Body() createCategoryDto: CreateCategoryDto) {
  //   console.log('BODY:', createCategoryDto);
  //   return this.categoryService.create(createCategoryDto);
  // }

  // @Delete(':id')
  // async remove(@Param('id', new ParseUUIDPipe()) id: string) {
  //   return this.categoryService.remove(+id);
  // }

  
  @Patch('choose-category')
  async chooseCatehory(@Body('categoryId') categoryId: string, @Req() req) {
    const userId = req.user.id;
    return this.categoryService.chooseCategory(userId, categoryId);
  }
}
