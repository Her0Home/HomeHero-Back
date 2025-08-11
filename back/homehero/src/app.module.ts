import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/typeorm';
import { SeederModule } from './seders/seeder.Module';
import { ChatModule } from './chat/chat.module';

// import { UsersModule } from './User.module';
import { UsersModule } from './users/users.module';
import { AddresModule } from './addres/addres.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { JwtModule } from '@nestjs/jwt';
import { CategoryModule } from './category/category.module';
import { SubcategoryModule } from './subcategory/subcategory.module';
import { MessageModule } from './message/message.module';
import { ChatGateway } from './chat/chat.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeOrmConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (ConfigService: ConfigService) =>
        ConfigService.get('typeorm')!,
    }),
      EventEmitterModule.forRoot(),
     CategoryModule,
     SubcategoryModule,
     SeederModule,
    AppointmentModule,
    ChatModule,
    MessageModule,
    UsersModule,
    AddresModule,
    ImagesModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions:{expiresIn: '1h'}
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
