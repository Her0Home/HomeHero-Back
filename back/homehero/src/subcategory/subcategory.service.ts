import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubCategory } from './entities/subcategory.entity';
import { Category } from 'src/category/entities/category.entity';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class SubcategoryService {

  constructor (
    @InjectRepository(SubCategory) private subcategoriesRepository: Repository<SubCategory>,
    private categoryService: CategoryService,
  ){}

  async getAll() {
    try {
      const subCategories: (SubCategory | null)[] = await this.subcategoriesRepository.find({relations:['category']});
      return subCategories;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error del servidor al mostrar las sub categorias');
    }
  }

  async create(body: CreateSubcategoryDto) {
    try {
      const {subcategori} = body
      const newSubCategory= await Promise.all (
        subcategori.map(async ({name,categoryId})=>{
          
          const category: Category = await this.categoryService.findOne(categoryId)
          const newSubCategory: SubCategory =this.subcategoriesRepository.create({name: name, category})
          const saveSubCategori: SubCategory | null = await this.subcategoriesRepository.save(newSubCategory)
          const response: SubCategory | null = await this.subcategoriesRepository.findOne({where:{id: saveSubCategori.id}})
          const newResponse = {...response, categoryId: category.id}
          return newResponse;
        }
      ))

      return newSubCategory;
    } catch (error) {
      
    }
  }

  async getSubCategorieById(id: string) {
    try {
      const subCategorie: SubCategory | null = await this.subcategoriesRepository.findOne({where:{id}});
      if(!subCategorie) throw new NotFoundException('Categoria no encontrada');
      return subCategorie;
    } catch (error) {
      console.log(error.message);
      if(error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al buscar la categoria');
    }
  }

  update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    return `This action updates a #${id} subcategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} subcategory`;
  }
}
