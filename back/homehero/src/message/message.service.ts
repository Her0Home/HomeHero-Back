import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm'; // Añadir importación de Not
import { Message } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from 'src/users/entities/user.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    private eventEmitter: EventEmitter2 
  ) {}

  async createMessage(createMessageDto: CreateMessageDto, sender: User): Promise<Message> {
    const { content, chatId } = createMessageDto;

    const chat = await this.chatRepository.findOne({
      where: { id: chatId },
      relations: ['cliente', 'profesional'],
    });

    if (!chat) {
      throw new NotFoundException(`Chat con ID ${chatId} no encontrado.`);
    }

    const isParticipant = chat.cliente.id === sender.id || chat.profesional.id === sender.id;

    if (!isParticipant) {
      throw new ForbiddenException('No tienes permiso para enviar mensajes en este chat.');
    }

    const newMessage = this.messageRepository.create({
      content: content,
      chat: chat,
      sender: sender,
      isRead: false,
    });
    
    const savedMessage = await this.messageRepository.save(newMessage);
  
    await this.chatRepository.update(
      { id: chatId },
      {
        lastMessageContent: savedMessage.content, 
        lastMessageAt: savedMessage.sentAt, 
      }
    );


    this.eventEmitter.emit('message.created', {
      chatId,
      message: savedMessage
    });
    
    return savedMessage;
  }

  async markMessagesAsRead(
    chatId: string,
    userId: string,
  ): Promise<{ affected: number }> {
  
    const result = await this.messageRepository.update(
      {
        chat: { id: chatId },
        sender: { id: Not(userId) },
        isRead: false
      },
      { isRead: true }
    );
    
    if ((result.affected ?? 0) > 0) {
      this.eventEmitter.emit('message.read', {
        chatId,
        userId,
        count: result.affected ?? 0
      });
    }
      
    return { affected: result.affected ?? 0 };
  }
  
  async getUnreadCount(userId: string): Promise<number> {
    const count = await this.messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.chat', 'chat')
      .where('(chat.cliente_id = :userId OR chat.profesional_id = :userId)', {
        userId,
      })
      .andWhere('message.sender_id != :userId', { userId })
      .andWhere('message.isRead = :isRead', { isRead: false })
      .getCount();

    return count;
  }
}