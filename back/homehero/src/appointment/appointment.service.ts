import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, EntityManager, In, LessThan, Not, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { AppointmentStatus } from 'src/appointment/Enum/appointmentStatus.enum';
import { Role } from 'src/users/assets/roles';
import { ChatService } from 'src/chat/chat.service';
import { ImagesService } from '../images/images.service';
import { FinishAppointmentDto } from './dto/finish-appointment.dto';

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
}

@Injectable()
export class AppointmentService {
  private readonly logger = new Logger(AppointmentService.name);
  
  constructor( 
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly chatService: ChatService,
    private readonly imageUploadService: ImagesService,
  ) {}
  
  async handleUnfulfilledAppointments() {
    this.logger.log('Iniciando la verificación de citas incumplidas...');
    const count = await this.processUnfulfilledAppointments();
    this.logger.log(`${count} citas han sido marcadas como incumplidas.`);
  }

  async processUnfulfilledAppointments(): Promise<number> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const overdueAppointments = await this.appointmentRepository.find({
      where: {
        status: AppointmentStatus.CONFIRMED,
        endTime: LessThan(yesterday),
      },
      relations: ['professional'],
    });

    for (const appointment of overdueAppointments) {
      appointment.status = AppointmentStatus.UNFULFILLED;
      await this.appointmentRepository.save(appointment);

      const professional = appointment.professional;
      if (professional) {
        professional.unfulfilledAppointments = (professional.unfulfilledAppointments || 0) + 1;

        if (professional.unfulfilledAppointments >= 3) {
          professional.isActive = false; // Suspensión de la cuenta
        }

        await this.userRepository.save(professional);
      }
    }
    return overdueAppointments.length;
  }

   private async findAndValidateAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['client', 'professional'],
    });
    if (!appointment) {
      throw new NotFoundException(`Cita con ID ${appointmentId} no encontrada.`);
    }
    return appointment;
  }

   async getDailySchedule(professionalId: string, date: string): Promise<TimeSlot[]> {

    const potentialHours = [8, 11, 14];
    
     const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    // const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);


    const bookedAppointments = await this.appointmentRepository.find({
      where: {
        professional: { id: professionalId },
        startTime: Between(startOfDay, endOfDay),
        status: Not(In([AppointmentStatus.CANCELED])), 
      },
    });

   
    const bookedHours = new Set(
      bookedAppointments.map(app => app.startTime.getUTCHours())
    );


    const schedule: TimeSlot[] = potentialHours.map(hour => {
      const startTime = new Date(date);
      startTime.setUTCHours(hour, 0, 0, 0);

      const endTime = new Date(startTime);
      endTime.setUTCHours(startTime.getUTCHours() + 3);

      const isAvailable = !bookedHours.has(hour);

      return {
        id: `${professionalId}-${startTime.toISOString()}`, 
        startTime: startTime,
        endTime: endTime,
        available: isAvailable,
      };
    });

    return schedule;
  }
  


  async createAppointment(createAppointmentDto: CreateAppointmentDto,  imageFile?: Express.Multer.File) {
    const { professionalId, clientId, startTime } = createAppointmentDto;

    const now = new Date();
    const appointmentStartTime = new Date(startTime);

    if (appointmentStartTime.getUTCDay() === 0) {
      throw new BadRequestException('No se pueden agendar citas los domingos.');
    }
    const minBookingTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (appointmentStartTime < minBookingTime) {
      throw new BadRequestException('La cita debe programarse con al menos 24 horas de antelación.');
    }
    const startHour = appointmentStartTime.getUTCHours();
    const allowedHours = [8, 11, 14]; 
    if (!allowedHours.includes(startHour)) {
      throw new BadRequestException(
        `La hora de inicio debe ser 08:00, 11:00, o 14:00.`,
      );
    }

    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 3);

     const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        professional: { id: professionalId },
        startTime: startTime,
      }
    });

    if (existingAppointment) {
      throw new ConflictException('Esta franja horaria ya no está disponible.');
    }

   return await this.dataSource.transaction(async (manager) => {

     let finalImageUrl: string | null = null;
      if (imageFile) {

        const uploadResult = await this.imageUploadService.uploadImage(imageFile);

        if (uploadResult && uploadResult.data) {
          finalImageUrl = uploadResult.data.url;
        }
      }

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
        startTime: startTime,
        endTime: endTime,
        description: createAppointmentDto.description,
        imageService: finalImageUrl,
        token: Math.floor(1000 + Math.random() * 9000),
        status: AppointmentStatus.PENDING,
        client: client,
        professional: professional,
      });
      
      await manager.save(newAppointment);
      return {
        message: 'Cita creada exitosamente. Falta la confirmación por parte del profesional.',
        appointment: {
          id: newAppointment.id,
          startTime: startTime,
          endTime: endTime,
          description: newAppointment.description,
          status: newAppointment.status,
          imageService: newAppointment.imageService,
          token: newAppointment.token,
          client: {
            id: newAppointment.client.id,
            name: newAppointment.client.name,
            email: newAppointment.client.email,
          },
          professional: {
            id: newAppointment.professional.id,
            name: newAppointment.professional.name,
            email: newAppointment.professional.email,
          }
        }
      };
    });
}
async rescheduleAppointment(appointmentId: string, dto: UpdateAppointmentDto) {
    const { userId, newStartTime } = dto;

    if (!newStartTime) {
      throw new BadRequestException('Se requiere la nueva fecha y hora (newStartTime) para reprogramar.');
    }
    const appointment = await this.findAndValidateAppointment(appointmentId);


    if (appointment.client.id !== userId && appointment.professional.id !== userId) {
      throw new UnauthorizedException('No tienes permiso para modificar esta cita.');
    }

  
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELED].includes(appointment.status)) {
      throw new ConflictException(`No se puede reprogramar una cita en estado '${appointment.status}'.`);
    }


    const now = new Date();
    if (newStartTime.getUTCDay() === 0) {
      throw new BadRequestException('No se pueden agendar citas los domingos.');
    }
    const minBookingTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (newStartTime < minBookingTime) {
      throw new BadRequestException('La cita debe programarse con al menos 24 horas de antelación.');
    }
    const startHour = newStartTime.getUTCHours();
    const allowedHours = [8, 11, 14];
    if (!allowedHours.includes(startHour)) {
      throw new BadRequestException('La hora de inicio debe ser 08:00, 11:00, o 14:00.');
    }


    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        professional: { id: appointment.professional.id },
        startTime: newStartTime,
      },
    });
    if (existingAppointment && existingAppointment.id !== appointmentId) {
      throw new ConflictException('El profesional ya tiene una cita en esa nueva franja horaria.');
    }


    appointment.startTime = newStartTime;
    appointment.endTime = new Date(newStartTime.getTime() + 3 * 60 * 60 * 1000);
    
    appointment.status = AppointmentStatus.PENDING;

    const updatedAppointment = await this.appointmentRepository.save(appointment);

    return {
      message: 'La cita ha sido reprogramada. Se requiere la confirmación de la otra parte.',
      appointment: {
        id: updatedAppointment.id,
        startTime: updatedAppointment.startTime,
        endTime: updatedAppointment.endTime,
        description: updatedAppointment.description,
        status: updatedAppointment.status,
        imageService: updatedAppointment.imageService,
        client: {
          id: updatedAppointment.client.id,
          name: updatedAppointment.client.name,
          email: updatedAppointment.client.email,
        },
        professional: {
          id: updatedAppointment.professional.id,
          name: updatedAppointment.professional.name,
          email: updatedAppointment.professional.email,
        }
      }
    };
  }


  findAll() {
    return this.appointmentRepository.find({
      relations: ['client', 'professional'], 
    });
  }

 async findAllByUser(userId: string) {

  const appointments = await this.appointmentRepository.find({
    where: [
      { client: { id: userId } },
      { professional: { id: userId } },
    ],
    relations: ['client', 'professional'],
  });


  const formattedAppointments = appointments.map((appointment) => {
    return {
      id: appointment.id,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      description: appointment.description,
      status: appointment.status,
      imageService: appointment.imageService,
      client: {
        id: appointment.client.id,
        name: appointment.client.name, 
        address: appointment.client.addres, 
      },
      professional: {
        id: appointment.professional.id,
        name: appointment.professional.name, 
        address: appointment.professional.addres, 
      },
    };
  });


  return formattedAppointments;
}
  async cancelAppointment(appointmentId: string, userId: string) {
    const appointment = await this.findAndValidateAppointment(appointmentId);


    if (appointment.client.id !== userId && appointment.professional.id !== userId) {
      throw new UnauthorizedException('No tienes permiso para cancelar esta cita.');
    }
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELED].includes(appointment.status)) {
        throw new ConflictException(`No se puede cancelar una cita que ya está ${appointment.status}.`);
    }

    appointment.status = AppointmentStatus.CANCELED;
    const updatedAppointment = await this.appointmentRepository.save(appointment);
    return {
      message: 'Cita cancelada exitosamente.',
      appointment: {
        id: updatedAppointment.id,
        startTime: updatedAppointment.startTime,
        endTime: updatedAppointment.endTime,
        description: updatedAppointment.description,
        status: updatedAppointment.status,
        imageService: updatedAppointment.imageService,
        client: {
          id: updatedAppointment.client.id,
          name: updatedAppointment.client.name,
          email: updatedAppointment.client.email,
        },
        professional: {
          id: updatedAppointment.professional.id,
          name: updatedAppointment.professional.name,
          email: updatedAppointment.professional.email,
        }
      }
    };
  }
  async finishAppointment(appointmentId: string, finishDto: FinishAppointmentDto) {
    const appointment = await this.findAndValidateAppointment(appointmentId);

    if (appointment.token !== finishDto.token) {
      throw new UnauthorizedException('Token inválido.');
    }
    if (appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new ConflictException('Solo se pueden finalizar citas que han sido confirmadas.');
    }

    appointment.status = AppointmentStatus.COMPLETED;
    appointment.canComment = true;
    const updatedAppointment = await this.appointmentRepository.save(appointment);
     return {
      message: 'Cita finalizada exitosamente.',
      appointment: {
        id: updatedAppointment.id,
        startTime: updatedAppointment.startTime,
        endTime: updatedAppointment.endTime,
        description: updatedAppointment.description,
        status: updatedAppointment.status,
        client: {
          id: updatedAppointment.client.id,
          name: updatedAppointment.client.name,
          email: updatedAppointment.client.email,
        },
        professional: {
          id: updatedAppointment.professional.id,
          name: updatedAppointment.professional.name,
          email: updatedAppointment.professional.email,
        }
      }
    };
  }
  async confirmAppointment(appointmentId: string, professionalId: string) {
    const appointment = await this.findAndValidateAppointment(appointmentId);

    if (appointment.professional.id !== professionalId) {
      throw new UnauthorizedException('No tienes permiso para confirmar esta cita.');
    }
    if (appointment.status !== AppointmentStatus.PENDING) {
      throw new ConflictException('Solo se pueden confirmar citas pendientes.');
    }

    appointment.status = AppointmentStatus.CONFIRMED;
    await this.chatService.createChatForAppointment(appointment); 
    const updatedAppointment = await this.appointmentRepository.save(appointment);
    return {
      message: 'Cita confirmada exitosamente.',
      appointment: {
        id: updatedAppointment.id,
        startTime: updatedAppointment.startTime,
        endTime: updatedAppointment.endTime,
        description: updatedAppointment.description,
        status: updatedAppointment.status,
        imageService: updatedAppointment.imageService,
        client: {
          id: updatedAppointment.client.id,
          name: updatedAppointment.client.name,
          email: updatedAppointment.client.email,
        },
        professional: {
          id: updatedAppointment.professional.id,
          name: updatedAppointment.professional.name,
          email: updatedAppointment.professional.email,
        }
      }
    };
  }
  async findAllByProfessional(professionalId: string): Promise<Appointment[]> {
    const professional = await this.userRepository.findOne({
      where: { id: professionalId, role: Role.PROFESSIONAL },
    });

    if (!professional) {
      throw new NotFoundException(
        `Profesional con ID ${professionalId} no encontrado`,
      );
    }

    return this.appointmentRepository.find({
      where: { professional: { id: professionalId } },
      relations: ['client', 'professional'],
      order: {
        startTime: 'DESC', 
      },
    });
  }
  }
