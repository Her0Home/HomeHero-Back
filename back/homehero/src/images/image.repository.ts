import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import toStream from 'buffer-to-stream';

@Injectable()
export class ImageRepository implements OnModuleInit {
  constructor(@Inject('CLOUDINARY') private cloudinaryConfig: any) {}

  onModuleInit() {
    // Asegurar que Cloudinary esté configurado
    if (!cloudinary.config().cloud_name) {
      this.cloudinaryConfig;
    }
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!);
          }
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
