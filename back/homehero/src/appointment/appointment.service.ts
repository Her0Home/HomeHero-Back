import { Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppointmentService {
  constructor( 
    // @InjectRepository(Appointment)
    // private appointmentRepository: Repository<Appointment>,
    // @InjectRepository (User)
    // private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}
  
  create(createAppointmentDto: CreateAppointmentDto) {
    return 'This action adds a new appointment';
  }







  
  findAll() {
    return `This action returns all appointment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} appointment`;
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
