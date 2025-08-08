import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/typeorm';
<<<<<<< HEAD
import { UsersModule } from './users/users.module';
import { AppointmentModule } from './appointment/appointment.module';
import { SeederModule } from './seders/seeder.Module';
=======

// import { UsersModule } from './User.module';
import { UsersModule } from './users/users.module';
import { AddresModule } from './addres/addres.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
>>>>>>> d7d751c75cbe9aab8dc219af6e1362a10bc5dc83

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
    
    SeederModule,
    AppointmentModule,
    UsersModule,

=======
    AppointmentModule,
    UsersModule,
    AddresModule,
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.SECRET_KEY,
      signOptions:{expiresIn: '1h'}
    }),
>>>>>>> d7d751c75cbe9aab8dc219af6e1362a10bc5dc83
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
