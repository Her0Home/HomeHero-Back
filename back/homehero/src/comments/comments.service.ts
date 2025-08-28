import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Comment } from './entities/comment.entity'; 
import { User } from '../users/entities/user.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AppointmentStatus } from '../appointment/Enum/appointmentStatus.enum';
import { ProfanityFilterService } from '../FilterComents/filterComents.service';
import { UsersService } from '../users/users.service'; 

@Injectable()
export class CommentsService {
  constructor(
   @InjectRepository(Comment)
  private commentsRepository: Repository<Comment>,
  
  @InjectRepository(Appointment) 
  private appointmentsRepository: Repository<Appointment>, 

  private dataSource: DataSource,
  private profanityFilterService: ProfanityFilterService,
  private readonly usersService: UsersService,
  ) {}

  async create(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    const { receiverId, appointmentId, rating, content } = createCommentDto;

    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: ['client', 'professional'], 
    });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new BadRequestException('No se puede comentar en citas no completadas');
    }

    const isClient = appointment.client.id === userId;
    const isProfessional = appointment.professional.id === userId;

    if (!isClient && !isProfessional) {
      throw new BadRequestException('Solo puedes comentar en tus propias citas');
    }

    const receiver = await this.usersService.getUserById(receiverId);

    if (!receiver) {
      throw new NotFoundException('Receptor no encontrado');
    }

    const existingComment = await this.commentsRepository.findOne({
      where: { appointmentId, senderId: userId }
    });

    if (existingComment) {
      throw new BadRequestException('Ya has comentado en esta cita');
    }

    if (content && this.profanityFilterService.hasProfanity(content)) {
      const badWords = this.profanityFilterService.findProfanityWords(content);
      throw new BadRequestException(
        `Tu comentario contiene lenguaje inapropiado: ${badWords.join(', ')}. Por favor, revísalo.`
      );
    }

    

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let savedComment: Comment;

    try {
      const comment = this.commentsRepository.create({
        content,
        rating,
        senderId: userId,
        receiverId,
        appointmentId
      });

    
      savedComment = await queryRunner.manager.save(comment);
  
       await queryRunner.commitTransaction();

    } catch (error) {

      await queryRunner.rollbackTransaction();
      throw error; 
    } finally {
 
      await queryRunner.release();
    }

 

    this.usersService.updateProfessionalStats(receiverId).catch(error => {
      console.error('Error en la actualización de estadísticas en segundo plano:', error);
    });

    const createdComment = await this.commentsRepository.findOne({
      where: { id: savedComment.id },
      relations: [
        'sender', 'receiver', 'appointment', 'appointment.client',
        'appointment.professional',
        'appointment.professional.subcategories'
      ],
    });

    if (!createdComment) {
      throw new NotFoundException('Comentario no encontrado después de crear');
    }

    return createdComment;
}

  async findAll(): Promise<Comment[]> {
    return this.commentsRepository.find({
      relations: ['sender', 'receiver', 'appointment'],
    });
  }

  async findByAppointment(appointmentId: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { appointmentId },
      relations: ['sender', 'receiver', 'appointment',],
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado para esta cita');
    }

    return comment;
  }

  async findByReceiver(receiverId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { receiverId },
      relations: ['sender', 'receiver', 'appointment'],
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver', 'appointment'],
    });

    if (!comment) {
      throw new NotFoundException('Comentario no encontrado');
    }

    return comment;
  }
  async findLatestForProfessional(professionalId: string): Promise<Comment[]> {
    const comments = await this.commentsRepository.find({
      where: { receiverId: professionalId },
      relations: [
        'sender',
        'appointment',
        'appointment.professional',
        'appointment.professional.subcategories',
      ],
      order: { createdAt: 'DESC' },

      take: 5,
    });

    return comments;
  }
}