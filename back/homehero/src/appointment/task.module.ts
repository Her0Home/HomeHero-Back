import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './task.service';
import { AppointmentModule } from '../appointment/appointment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // Usamos forwardRef para romper la dependencia circular
    forwardRef(() => AppointmentModule),
  ],
  providers: [TasksService],
})
export class TasksModule {}

