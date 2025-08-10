import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ImageRepository } from './image.repository';
import { CloudinaryConfig } from 'src/config/cloudinary';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Image } from './entities/image.entity';



@Module({
  imports: [TypeOrmModule.forFeature([Image,User])],
  controllers: [ImagesController],
  providers: [ImagesService, ImageRepository, CloudinaryConfig],
  exports: [ImagesService, ImageRepository],
})
export class ImagesModule {}
