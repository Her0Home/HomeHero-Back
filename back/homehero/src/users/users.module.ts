import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { CategoryModule } from 'src/category/category.module';
import { AddresModule } from 'src/addres/addres.module';
import { Comment } from 'src/comments/entities/comment.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Comment , Appointment]), EmailModule, CategoryModule, AddresModule],
  controllers: [UsersController],
  providers: [UsersService],
   exports: [UsersService]
})
export class UsersModule  {}

