import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { CommonModule } from '../FilterComents/Common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, User, Appointment]),
    CommonModule
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}