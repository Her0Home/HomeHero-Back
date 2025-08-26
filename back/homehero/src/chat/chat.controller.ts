import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { LogginGuard } from 'src/guards/loggin.guard';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAll(@Req() req: Request) {
    const currentUser = req.user as User;
    return this.chatService.findUserChats(currentUser.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const currentUser = req.user as User;
    return this.chatService.getChatByIdWithMessages(id, currentUser);
  }
}
