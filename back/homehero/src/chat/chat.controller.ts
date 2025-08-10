<<<<<<< HEAD
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
=======
import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
>>>>>>> f5dde4c79b4c396d9561955ffb49326fcc0f84a2
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatService.create(createChatDto);
  }

  @Get()
  findAll() {
    return this.chatService.findAll();
  }

  @Get(':id')
<<<<<<< HEAD
  findOne(@Param('id') id: string) {
=======
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
>>>>>>> f5dde4c79b4c396d9561955ffb49326fcc0f84a2
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
<<<<<<< HEAD
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
=======
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() updateChatDto: UpdateChatDto) {
>>>>>>> f5dde4c79b4c396d9561955ffb49326fcc0f84a2
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
<<<<<<< HEAD
  remove(@Param('id') id: string) {
=======
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
>>>>>>> f5dde4c79b4c396d9561955ffb49326fcc0f84a2
    return this.chatService.remove(+id);
  }
}
