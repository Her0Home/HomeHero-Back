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
import { SubcategoryModule } from 'src/subcategory/subcategory.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Comment , Appointment]),AuthModule, EmailModule, CategoryModule, AddresModule,SubcategoryModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule  {}

