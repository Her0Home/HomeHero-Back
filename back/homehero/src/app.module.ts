import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';

import typeOrmConfig from './config/typeorm';

// --- Módulos de Funcionalidades ---
import { AppointmentModule } from './appointment/appointment.module';
import { SeederModule } from './seders/seeder.Module';
import { ChatModule } from './chat/chat.module';
import { UsersModule } from './users/users.module';
import { AddresModule } from './addres/addres.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { CategoryModule } from './category/category.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { MessageModule } from './message/message.module';
import { EmailModule } from './email/email.module';
import { Auth0Module } from './auth0/auth0.module';
import { StripeModule } from './stripe/stripe.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    // --- Módulos de Configuración Global (Primero) ---
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('typeorm')!,
    }),
    ScheduleModule.forRoot(), // Módulo global de Tareas Programadas
    EventEmitterModule.forRoot(), // Módulo global de Eventos
    JwtModule.registerAsync({ // Configuración de JWT
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('SECRET_KEY'),
        signOptions: { expiresIn: '1h' },
      }),
      global: true, // Hacer JWT global
    }),

    // --- Módulos de la Aplicación ---
    CategoryModule,
    SubcategoryModule,
    SeederModule,
    Auth0Module,
    AppointmentModule,
    ChatModule,
    MessageModule,
    UsersModule,
    AddresModule,
    ImagesModule,
    StripeModule,
    AuthModule,
    EmailModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
