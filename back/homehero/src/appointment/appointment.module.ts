import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule'; // Importar ScheduleModule
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { ImagesModule } from 'src/images/images.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User]),
    ChatModule,
    AuthModule,
    ImagesModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService], 
})
export class AppointmentModule {}