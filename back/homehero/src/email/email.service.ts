import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmailDto } from './dto/create-email.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class EmailService {
  
  constructor(private mailerService: MailerService){}
  
  async sendEmailCreate(email: string, user: string) {

    try {
      
      const url:string = 'https://openai.com/es-419/'
      console.log(email);
      
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
      throw new InternalServerErrorException('No se pudo encontrar la direccion del correo', error);
    }

  
  }

  async sendPaymentSuccessEmail(user: User, amount: number, paymentIntentId: string) {

    try {
      await this.mailerService.sendMail({
      from: '"Tu Empresa" no-reply@tuempresa.com',
      to: user.email,
      subject: '✅ Confirmación de tu pago'
    });
      console.log(`Correo de pago exitoso enviado a ${user.email}`);
    } catch (error) {
      console.error(`Error al enviar correo a ${user.email}:`, error);
    }
  }
}
