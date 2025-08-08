import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { AppointmentStatus } from 'src/appointmentStatus.enum';

@Injectable()
export class AppointmentService {
  constructor( 
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository (User)
    private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createAppointment(createAppointmentDto: CreateAppointmentDto) {
   return await this.dataSource.transaction(async (manager) => {

    const client = await manager.findOne(User,{where: {id: createAppointmentDto.clientId}});
  if (!client) {
    throw new NotFoundException(`Client with ID ${createAppointmentDto.clientId} not found`);
  }

  const professional = await manager.findOne(User, {where: {id: createAppointmentDto.professionalId}});
  if (!professional) {
    throw new NotFoundException(`Professional with ID ${createAppointmentDto.professionalId} not found`);
  }
  const newAppointment = manager.create(Appointment, {
    date: createAppointmentDto.date,
    time: createAppointmentDto.time,
    description: createAppointmentDto.description,
    imageService: createAppointmentDto.imageService,
    token: Math.floor(1000 + Math.random() * 9000),
    status: AppointmentStatus.PENDING,
    Client: client,
    Professional: professional,
  });
  await manager.save(newAppointment);
  return newAppointment;
});
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
