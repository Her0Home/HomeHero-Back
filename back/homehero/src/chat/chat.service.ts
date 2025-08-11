import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/message/entities/message.entity';
import { MessageService } from 'src/message/message.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private readonly messageService: MessageService,
    private eventEmitter: EventEmitter2
  ) {}

  async createChatForAppointment(appointment: Appointment): Promise<Chat> {
    const existingChat = await this.chatRepository.findOne({
      where: { appointment: { id: appointment.id } },
    });

    if (existingChat) {
      return existingChat;
    }

    const newChat = this.chatRepository.create({
      appointment: appointment,
      cliente: appointment.client,
      profesional: appointment.professional,
    });

    return this.chatRepository.save(newChat);
  }

  async getChatByIdWithMessages(chatId: string, currentUser: User): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: [
        'messages',          
        'messages.sender',    
        'cliente',           
        'profesional',       
      ],
      order: {
        messages: { sentAt: 'ASC' }
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat con ID ${chatId} no encontrado.`);
    }

    const isParticipant = chat.cliente.id === currentUser.id || chat.profesional.id === currentUser.id;

    if (!isParticipant) {
      throw new ForbiddenException('No tienes permiso para acceder a este chat.');
    }

    const result = await this.messageService.markMessagesAsRead(chatId, currentUser.id);
  console.log('Mensajes marcados como leídos:', result);
  

  if (chat.messages && chat.messages.length > 0) {
    chat.messages.forEach(message => {
      if (message.sender.id !== currentUser.id) {
        message.isRead = true;
      }
    });
  }
  
  this.eventEmitter.emit('chat.viewed', { chatId, userId: currentUser.id });
  
  return chat;

  }

  async findUserChats(userId: string): Promise<any[]> {
    const query = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.cliente', 'cliente')
      .leftJoinAndSelect('chat.profesional', 'profesional')
      
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(message.id)')
            .from(Message, 'message')
            .where('message.chat_id = chat.id')
            .andWhere('message.isRead = false')
            .andWhere('message.sender_id != :userId', { userId }),
        'chat_unreadCount'
      )
      .where('chat.cliente_id = :userId OR chat.profesional_id = :userId', { userId })
      .orderBy('chat.lastMessageAt', 'DESC', 'NULLS LAST');

    const { entities, raw } = await query.getRawAndEntities();

    return entities.map((entity, index) => ({
      ...entity,
      unreadCount: parseInt(raw[index].chat_unreadCount, 10),
    }));
  }
}