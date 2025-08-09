import { Module } from '@nestjs/common';
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
})
export class ImagesModule {}
