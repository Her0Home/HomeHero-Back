import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException, ParseUUIDPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { DeleteResult } from 'typeorm/browser';
import { Role } from './assets/roles';
import { EmailService } from 'src/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { writeHeapSnapshot } from 'v8';
import { UpdateResult } from 'typeorm/browser';
import { ratingUserDto } from './dto/rating-user.dto';
import { updateRole, UpdateUser } from './dto/update-user.dto';
import { CategoryService } from 'src/category/category.service';
import { Category } from 'src/category/entities/category.entity';
import { AddresService } from 'src/addres/addres.service';
import { Addre } from 'src/addres/entities/addre.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { AppointmentStatus } from 'src/appointment/Enum/appointmentStatus.enum';
import { SubcategoryService } from 'src/subcategory/subcategory.service';
import { SubCategory } from 'src/subcategory/entities/subcategory.entity';
import { findSourceMap } from 'module';

// import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Appointment) private appointmentRepository: Repository<Appointment>,
    private categoryService: CategoryService,
    private addreService: AddresService,
    private subcategoriService: SubcategoryService,
    private emailService: EmailService,
    private jwtService: JwtService, // ← CORRECTO
  ) {}

  async updateProfessionalStats(userId: string) {
    try {
     
      const allComments = await this.commentRepository.find({
        where: { receiverId: userId },
      });
      const totalRating = allComments.reduce((sum, comment) => sum + comment.rating, 0);
      const averageRating = allComments.length > 0 ? totalRating / allComments.length : 0;

      
      const totalAppointments = await this.appointmentRepository.count({
        where: {
          professional: { id: userId },
          status: AppointmentStatus.COMPLETED,
        },
      });


      await this.userRepository.update(userId, {
        averageRating: averageRating,
        totalAppointments: totalAppointments,
      });
      
      console.log(`Estadísticas actualizadas para el usuario: ${userId}`);

    } catch (error) {
      console.error(`Error al actualizar estadísticas para el usuario ${userId}:`, error);
    }
  }

  async getAllUser () {

    try {

      const users: User[] | null = await this.userRepository.find();
      return users;

    } catch (error) {
      throw new BadRequestException ('Error');
    }

  }


  async deleteUser(id:string){

    try {
      const foundUser: User | null = await this.userRepository.findOne({where: {id: id}});
      console.log( typeof id);
      
      if(!foundUser){
        throw new NotFoundException('Usuario no encontrado');
      }
      
      const userRemove: DeleteResult = await this.userRepository.delete(id);
      
      if(userRemove.affected===0){
        throw new NotFoundException(`Usiario no encontrado con el id: ${id}` );
      }
      
      return 'Usuario eliminado correctamente';  
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Error al eliminar el user');
    }
      
      
  }


  async getUserById(id: string){

    try {
      const userFind: User | null = await this.userRepository.findOne({where:{id: id}});

      if(!userFind){
        throw new NotFoundException(`Userio no encontrado con el id: ${id} `);
      }

      const mount:number= 3000;
      const x= "hola"
      await this.emailService.sendPaymentSuccessEmail(userFind, mount, x)

      return userFind;

    } catch (error) {
      
      throw new InternalServerErrorException('Error en servidor');

    }


  }
  
  

  async getProfessionalById(id: string) {
  const professional = await this.userRepository.findOne({
    where: { id },
    relations: ['category', 'subcategories', 'addres'], 
  });

  if (!professional) {
    throw new NotFoundException('Profesional no encontrado.');
  }

  return {
    id: professional.id,
    name: professional.name,
    city: professional.addres && professional.addres.length > 0 ? professional.addres[0].city : null,
    imageProfile: professional.imageProfile,
    description: professional.description,
    averageRating: professional.averageRating,
    totalAppointments: professional.totalAppointments,
    isVerified: professional.isVerified,
    isMembresyActive: professional.isMembresyActive,
    category: professional.category,
    subcategories: professional.subcategories,
  };
}

  async changeRole(id: string, body: updateRole) {
    const { role } = body;

    if (!Object.values(Role).includes(role)) {
      throw new BadRequestException(`El rol ${role} no es válido`);
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`El usuario con id ${id} no fue encontrado`);
    }

    user.role = role;
    user.isVerified= true;
    await this.userRepository.save(user);

    // Generar token actualizado
    const payload = { id: user.id, email: user.email, role: user.role };
    const newToken = this.jwtService.sign(payload);

    const userResponse ={
      isActive: user.isActive,
      isVerified: user.isVerified,
      role: user.role,
      id: user.id,
      name: user.name,
      isMembresyActive: user.isMembresyActive,
    }

    return { access_token: newToken, user:userResponse };
  }

  async getAllProfesional (page: number, limit: number): Promise<User[] | undefined>{

    try {

      const safePage = page && page>0 ? page: 1;
      const safeLimit = limit && limit>0? limit : 2;

      const profesionals: User[] | null = await this.userRepository.find({where:{role: Role.PROFESSIONAL, isVerified: true}})
      if(!profesionals){
        throw new InternalServerErrorException('Error al mostrar los profesionales');
      }

      const start:number = (safePage-1)*safeLimit;
      const end:number = safeLimit + start;

      const profesionales: User[] | null = profesionals.slice(start,end)

      return profesionales;
      
    } catch (error) {
      throw new InternalServerErrorException('Error al mostrar los profesionales', error);
    }

  }


  async getUserFilter(filter : {role: Role | undefined, email?: string,id?:string, name?: string, }): Promise<(User[])>{

    try {  
      const where = {isVerified: true};
      const arrayFilter = Object.entries(filter);
      arrayFilter.forEach(([key, value]) =>{

        if(!value) return

        if(key==='name'){
          where[key] = ILike(`%${value}%`);
        }else{
          where[key]= value;
        }

      });

      console.log(where);

      const users: User[] = await this.userRepository.find({where});

      return users;

              
    } catch (error) {

      throw new InternalServerErrorException('Error al buscar los usuarios', error);

    }

  }
  async searchActiveProfessionals(categoryId?: string, page: number = 1, limit: number = 10): Promise<User[]> {
    try {
      const query = this.userRepository.createQueryBuilder('user');
      
      query.leftJoinAndSelect('user.category', 'category');
      
      query.where('user.isActive = :isActive', { isActive: true });
      query.andWhere('user.isMembresyActive = :isMembresyActive', { isMembresyActive: true });
      query.andWhere('user.role = :role', { role: Role.PROFESSIONAL });

      if (categoryId) {
        query.andWhere('category.id = :categoryId', { categoryId });
      }

      query.skip((page - 1) * limit);
      query.take(limit);

      const professionals = await query.getMany();
      
      return professionals;

    } catch (error) {
      throw new InternalServerErrorException('Error al buscar los profesionales', error);
    }
  }


  async banUser(id: string){
    try {
      
      const userUpdate: UpdateResult = await this.userRepository.update(id, {isActive: false});

      if(userUpdate.affected===0){
        throw new NotFoundException(`No se ha podido encontrar el usuario con id: ${id}`);
      }

      const findUser: User | null = await this.userRepository.findOne({where:{id}});

      return findUser;

    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error al eliminar el user')

    }
  }


  async ratingProfessionals(query: ratingUserDto){
    try {
      const {sort = 'averageRating', order = 'DESC'} = query;

      const validSort = ['averageRating','name'];  
      const sortColumn = validSort.includes(sort)? sort : 'averageRating';

      const sortOrder: 'ASC' | 'DESC' = order === 'ASC' ? 'ASC' : 'DESC';

      
      const [professionals, total] = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.category', 'category')
      .leftJoinAndSelect('user.subcategories', 'subcategories')
      .leftJoinAndSelect('user.addres', 'addres')
      .select([
        'user',                  
        'category',              
        'subcategories',         
        'addres.city'            
      ])
      .where('user.role = :role', { role: Role.PROFESSIONAL })
      .orderBy(`user.${sortColumn}`, sortOrder as 'ASC' | 'DESC')
      .getManyAndCount();

      return professionals;
    } catch (error) {
      console.log(error);
      
    }
    
  }


  async putUser (userId: string, body: UpdateUser ){

    const {categoriesId, birthdate, city, aptoNumber, streetNumber, imageProfile, subCategoriesName,dni,description} = body
    
    try {


      
      const findUser: User| null = await this.userRepository.findOne({where:{ id: userId}});
      if(!findUser){
        throw new NotFoundException(`No se encontro usuario con el id: ${userId}`)
      } 

       if (categoriesId) {
        const newCategory: Category | null = await this.categoryService.findOne(categoriesId);
        if(!newCategory) throw new NotFoundException(`Categoria con id: ${categoriesId}, no encontrada`);
        findUser.category = newCategory;
      }


      const addre: Addre | null = await this.addreService.create({city, aptoNumber,streetNumber}, findUser.id)
      if(!addre) throw new InternalServerErrorException('Error al crear la direccion');
      
      if(subCategoriesName){
         const userSubCategoriesUnfiltred: SubCategory[] = await Promise.all(
          subCategoriesName.map(async (nameSubCat)=>{
          const subCategory: SubCategory | undefined = await this.subcategoriService.getSubCategorieById(nameSubCat);
          if(!subCategory) throw new BadRequestException(`Error al asignar la subcategoria ${nameSubCat}`);
          return subCategory;
          })
        )
        
        const userSubCategories = userSubCategoriesUnfiltred.filter((subCat): subCat is SubCategory=> !!subCat)

      findUser.subcategories= userSubCategories;
      }

      findUser.isVerified=true;
      findUser.description= description;
      findUser.birthdate= birthdate;
      findUser.imageProfile= imageProfile;
      findUser.dni= +dni;
      findUser.addres= [addre];

      const saveUser= await this.userRepository.save(findUser)

      return saveUser;


    } catch (error) {
      
      console.log(error);
      if(error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al actualizar el usuario')
      
    }

  }
  
  



}
  
