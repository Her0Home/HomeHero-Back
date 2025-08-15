import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  
  constructor(private mailerService: MailerService){}
  
  async sendEmailCreate(email: string, user: string) {

    try {
      
      const url:string = 'https://openai.com/es-419/'
  
      await this.mailerService.sendMail({
        to: email,
        subject:'Bienvenido a Home Hero',// Asunto del Email
        template:'welcome',
        context:{
          name: user,
          appName: 'Home Hero',
          loginUrl: url
        }
      })

    } catch (error) {
      throw new InternalServerErrorException('No se pudo encontrar la direccion del correo');
    }

  
  }
}
