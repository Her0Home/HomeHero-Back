import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppointmentModule } from './appointment/appointment.module';

@Module({
  imports: [AppointmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
