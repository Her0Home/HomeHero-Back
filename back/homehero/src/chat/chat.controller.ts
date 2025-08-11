<<<<<<< HEAD
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
=======
import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
>>>>>>> e81dcabc5ed54eff0cd75e6840387296097e43b9
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { User } from 'src/users/entities/user.entity';

@Controller('chats')
@UseGuards(AuthGuard('jwt')) 
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  findAll(@Req() req: Request) {
    const currentUser = req.user as User;
    return this.chatService.findUserChats(currentUser.id);
  }

  @Get(':id')
<<<<<<< HEAD
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.chatService.remove(+id);
  }
}
=======
  findOne(@Param('id') id: string, @Req() req: Request) {
    const currentUser = req.user as User;
    return this.chatService.getChatByIdWithMessages(id, currentUser);
  }
}
>>>>>>> e81dcabc5ed54eff0cd75e6840387296097e43b9
