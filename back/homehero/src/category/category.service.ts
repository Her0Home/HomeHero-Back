import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  async findAll() {
    const categories = await this.categoryRepository.find();
    return 'todavia no hay categorias' + categories;
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new Error('La categoria no existe');
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
  const category = await this.categoryRepository.findOne({ where: { id } });
  if (!category) {
    throw new NotFoundException(`La categoria con id ${id} no existe`);
  }
  const updatedCategory = this.categoryRepository.save({
    ...category,
    ...updateCategoryDto,
    subCategoryArray: updateCategoryDto.subCategoryArray
      ? updateCategoryDto.subCategoryArray.map(String)
      : category.subCategoryArray,
  });
  return updatedCategory;
  }

  async create(userId: number, createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      users_id: userId,
      subCategoryArray: createCategoryDto.subCategoryArray
        ? createCategoryDto.subCategoryArray.map(String)
        : [],
    });
    try {
      const createdCategory = await this.categoryRepository.save(category);
      return createdCategory;
    } catch (error) {
      throw new Error('La categoria no pudo ser creada'); 
    
  }
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`La categoria con id ${id} no existe`);
    }
    await this.categoryRepository.delete({ id });
    return category;
  }
}
