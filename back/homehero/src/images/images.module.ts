import { Module } from '@nestjs/common';
<<<<<<< HEAD
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
=======
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { Image } from './entities/image.entity';
import { ImageRepository } from './image.repository';
import { CloudinaryConfig } from '../config/cloudinary';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image,User])],
  controllers: [ImagesController],
  providers: [ImagesService, ImageRepository, CloudinaryConfig],
  exports: [ImagesService, ImageRepository],
>>>>>>> 93efc308a68bb6f9a2f1404f4fd1eebc6b6ecb8e
})
export class ImagesModule {}
