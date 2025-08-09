import { ConfigService } from '@nestjs/config';

export const cloudinaryConfig = {
  provide: 'CLOUDINARY_CONFIG',
  useFactory: (configService: ConfigService) => ({
    cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME'),
    api_key: configService.get<string>('CLOUDINARY_API_KEY'),
    api_secret: configService.get<string>('CLOUDINARY_API_SECRET'),
  }),
  inject: [ConfigService],
};