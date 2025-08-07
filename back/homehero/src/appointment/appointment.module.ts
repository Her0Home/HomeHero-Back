<<<<<<< HEAD
// import { Module } from '@nestjs/common';
// import { AppointmentService } from './appointment.service';
// import { AppointmentController } from './appointment.controller';
// import { Appointment } from './entities/appointment.entity';
// // import { User } from 'src/user.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';
=======
import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
>>>>>>> origin/Desarrollo

// @Module({
//   imports: [TypeOrmModule.forFeature([Appointment, User])],
//   controllers: [AppointmentController],
//   providers: [AppointmentService],
// })
// export class AppointmentModule {}
