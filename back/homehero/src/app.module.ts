import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { AppointmentModule } from './appointment/appointment.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import typeOrmConfig from './config/typeorm';
import { UsersModule } from './users/users.module';
import { AppointmentModule } from './appointment/appointment.module';
import { SeederModule } from './seders/seeder.Module';

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
    
    SeederModule,
    AppointmentModule,
    UsersModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
