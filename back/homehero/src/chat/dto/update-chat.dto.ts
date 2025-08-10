<<<<<<< HEAD
import { PartialType } from '@nestjs/swagger';
=======
import { PartialType } from '@nestjs/mapped-types';
>>>>>>> f5dde4c79b4c396d9561955ffb49326fcc0f84a2
import { CreateChatDto } from './create-chat.dto';

export class UpdateChatDto extends PartialType(CreateChatDto) {}
