import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailModule } from 'src/email/email.module';
import { requiresAuth } from 'express-openid-connect';
import { CategoryModule } from 'src/category/category.module';
import { AddresModule } from 'src/addres/addres.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule, CategoryModule, AddresModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule  {}

