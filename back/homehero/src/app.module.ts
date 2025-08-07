import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AppointmentModule } from './appointment/appointment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/typeorm';
<<<<<<< HEAD
// import { UsersModule } from './User.module';
=======
import { UsersModule } from './users/users.module';
<<<<<<< HEAD
import { AddresModule } from './addres/addres.module';
=======
>>>>>>> origin/Desarrollo
>>>>>>> d7b2fb3087153c0c8fadc027d66e4db5041496cc

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
<<<<<<< HEAD
    AppointmentModule,
    UsersModule,
    AddresModule
=======
    // AppointmentModule,
    // UsersModule
>>>>>>> d7b2fb3087153c0c8fadc027d66e4db5041496cc
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
