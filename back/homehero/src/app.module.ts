import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeorm from './config/typeorm';

@Module({
  imports: [AppointmentModule, UsersModule,
    ConfigModule.forRoot({isGlobal: true, load:[typeorm]}),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService)=>config.get('typeorm')!,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
