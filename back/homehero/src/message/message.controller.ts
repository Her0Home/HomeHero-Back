import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

@Controller('messages')
@UseGuards(AuthGuard('jwt')) 
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @Req() req: Request) {
    const sender = req.user as User; 
    return this.messageService.createMessage(createMessageDto, sender);
  }
}