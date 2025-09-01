import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { Appointment } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { ChatModule } from '../chat/chat.module';
import { AuthModule } from '../auth/auth.module';
import { ImagesModule } from 'src/images/images.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User]),
    ChatModule,
    AuthModule, 
    ImagesModule,
    ScheduleModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService],
})
export class AppointmentModule {}