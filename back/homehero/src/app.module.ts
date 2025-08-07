import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AppointmentModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
