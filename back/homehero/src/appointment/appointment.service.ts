import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { AppointmentStatus } from 'src/appointment/Enum/appointmentStatus.enum';
import { Role } from 'src/users/assets/roles';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class AppointmentService {
  constructor( 
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly chatService: ChatService,
  ) {}

  async createAppointment(createAppointmentDto: CreateAppointmentDto) {
   return await this.dataSource.transaction(async (manager) => {
      const client = await manager.findOne(User, {
        where: {id: createAppointmentDto.clientId, role: Role.CLIENTE}
      });
      
      if (!client) {
        throw new NotFoundException(`Client with ID ${createAppointmentDto.clientId} not found`);
      }

      const professional = await manager.findOne(User, {
        where: {id: createAppointmentDto.professionalId, role: Role.PROFESSIONAL}
      });
      
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
        client: client,
        professional: professional,
      });
      
      await manager.save(newAppointment);
      return newAppointment;
    });
  }

  async updateAppointment(
    appointmentId: string,
    professionalId: string,
    dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.dataSource.transaction(async (manager) => {
      const appointment = await this.validateProfessionalAndAppointment(
        manager, 
        appointmentId, 
        professionalId
      );

      const { status, date, time } = dto;
      const updateData: Partial<Appointment> = {};
      if (status !== undefined) updateData.status = status;
      if (date !== undefined) updateData.date = date;
      if (time !== undefined) updateData.time = time;

      await manager.update(Appointment, { id: appointmentId }, updateData);
      const updatedAppointment = await manager.findOneOrFail(Appointment, {
        where: { id: appointmentId },
        relations: ['professional', 'client'],
      });
        
      if (status === AppointmentStatus.CONFIRMED) {
        try {
          await this.chatService.createChatForAppointment(updatedAppointment);
        } catch (error) {
          
        }
      }
      
if (status === AppointmentStatus.COMPLETED) {
  appointment.canComment = true;
}
      
      return updatedAppointment;
    });
  }

  private async validateProfessionalAndAppointment(
    manager: EntityManager,
    appointmentId: string,
    professionalId: string,
  ): Promise<Appointment> {
    const professional = await manager.findOne(User, {
      where: { id: professionalId, role: Role.PROFESSIONAL },
    });
    
    if (!professional) {
      throw new NotFoundException(`Professional with ID ${professionalId} not found`);
    }

    const appointment = await manager.findOne(Appointment, {
      where: { id: appointmentId },
      relations: ['professional', 'client'],
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    if (appointment.professional.id !== professionalId) {
      throw new NotFoundException('Unauthorized');
    }

    return appointment;
  }

  findAll() {
    return this.appointmentRepository.find({
      relations: ['client', 'professional'], 
    });
  }

  findOne(id: string) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ['client', 'professional'],
    });
  }
}
