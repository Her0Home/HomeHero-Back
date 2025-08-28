import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { LogginGuard } from 'src/guards/loggin.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiBearerAuth() 
  @UseGuards(AuthGuard('jwt')) 
  findAll(@Req() req: Request) {
    const currentUser = req.user as User;
    return this.chatService.findUserChats(currentUser.id);
  }

  @Get(':id')
  @ApiBearerAuth() 
  @UseGuards(AuthGuard('jwt')) 
  findOne(@Param('id') id: string, @Req() req: Request) {
    const currentUser = req.user as User;
    return this.chatService.getChatByIdWithMessages(id, currentUser);
  }
}
