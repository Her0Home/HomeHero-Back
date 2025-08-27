import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { Exception } from 'handlebars';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    try {
      
      const categories: (Category | null)[] = await this.categoryRepository.find({
        relations:['subcategories']
      });
      console.log(categories);
      return  categories;

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al traer las categorias')
    }
  }

  async findOne(id: string): Promise<Category> {
    try {
      const category: Category | null = await this.categoryRepository.findOne({ where: { id:id}, relations:['subcategories'] });
      if (!category) {
        throw new Error('La categoria no existe');
      }
      return category;

    } catch (error) {
      console.log(error);
      
      throw new InternalServerErrorException("Error al buscar la categoria");
    }
  }

  async findCategoryName(name: string){

    try {
      const category: Category [] = await this.categoryRepository.find({where:{name: ILike(`%${name}%`)}, relations:['subcategories']})
      if(category.length===0) throw new NotFoundException(`no existe ninguna categoria con el nombre '${name}'`);

      return category;
    } catch (error) {
      console.log(error);
      if(error instanceof Exception) throw error;
      throw new InternalServerErrorException('Error interno al buscar la category');
    }

  }

  // async update(id: string, updateCategoryDto: UpdateCategoryDto) {
  //   const category = await this.categoryRepository.findOne({ where: { id } });
  //   if (!category) {
  //     throw new NotFoundException(`La categoria con id ${id} no existe`);
  //   }
  //   const updatedCategory = this.categoryRepository.save({
  //     ...category,
  //     ...updateCategoryDto,
  //     subCategoryArray: updateCategoryDto.subCategoryArray
  //       ? updateCategoryDto.subCategoryArray.map((subCategory) => subCategory)
  //       : category.subcategories,
  //   });
  //   return updatedCategory;
  // }

  // async create(createCategoryDto: CreateCategoryDto) {
  //   const category = this.categoryRepository.create({
  //     ...createCategoryDto,
  //     subCategoryArray: createCategoryDto.subCategoryArray
  //       ? createCategoryDto.subCategoryArray.map(String)
  //       : undefined,
  //   });
  //   return this.categoryRepository.save(category);
  // }

  // async remove(id: number) {
  //   const category = await this.categoryRepository.findOne({ where: { id } });
  //   if (!category) {
  //     throw new NotFoundException(`La categoria con id ${id} no existe`);
  //   }
  //   await this.categoryRepository.delete({ id });
  //   return category;
  // }

  async chooseCategory(userId: string, categoryId: string) {
    try {
      
      const user = await this.categoryRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`El usuario con id ${userId} no existe`);
      }
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`La categoria con id ${categoryId} no existe`);
      }
      return this.categoryRepository.save(user);
    } catch (error) {
      
    }
  }
}
