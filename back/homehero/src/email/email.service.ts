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
      
      
      
      
      await this.mailerService.sendMail({
        to: email,
        subject:'Bienvenido a Home Hero',// Asunto del Email
        template:'welcome',
        context:{
          name:user,
          loginUrl: 'https://home-hero-front-mbak.vercel.app/login', // link a tu frontend
          year: new Date().getFullYear(),
        }
      })

    } catch (error) {
      throw new InternalServerErrorException('No se pudo encontrar la direccion del correo', error);
    }

  
  }

  async sendPaymentSuccessEmail(user: User, amount: number, paymentIntentId: string) {

    const url: string = "https://docs.stripe.com/testing?locale=es-419"

    try {
      await this.mailerService.sendMail({
      to: user.email,
      subject: '✅ Confirmación de tu pago',
       template:'welcomeProfessional',
        context:{
          email: user.email,
          name: user.name,
          amount: amount,
          year: new Date().getFullYear(),
          paymentMethod: paymentIntentId,
        }
    });
      console.log(`Correo de pago exitoso enviado a ${user.email}`);
    } catch (error) {
      console.error(`Error al enviar correo a ${user.email}:`, error);
    }
  }
}
