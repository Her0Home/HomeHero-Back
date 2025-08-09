import { Injectable } from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { Repository } from 'typeorm';
import { ImageRepository } from './image.repository';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly imageUploadRepository: ImageRepository,
  ) {}

  async uploadImage(file: Express.Multer.File) {
    try {
      const result = await this.imageUploadRepository.uploadImage(file);
      
      // Guardar la información de la imagen en la base de datos
      const imageData = {
        image: result.secure_url, // Usar el campo 'image' que existe en la entidad
      };
      
      const savedImage = await this.imageRepository.save(imageData);
      
      return {
        success: true,
        data: {
          id: savedImage.id,
          url: result.secure_url,
          publicId: result.public_id,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        },
      };
    } catch (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }

  async create(createImageDto: CreateImageDto) {
    const images = await this.imageRepository.save(createImageDto);
    return images;
  }

  findAll() {
    return `This action returns all images`;
  }

  findOne(id: number) {
    return `This action returns a #${id} image`;
  }

  update(id: number, updateImageDto: UpdateImageDto) {
    return `This action updates a #${id} image`;
  }

  remove(id: number) {
    return `This action removes a #${id} image`;
  }
}
