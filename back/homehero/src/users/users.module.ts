import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { adminController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
<<<<<<< HEAD
import { EmailModule } from 'src/email/email.module';
=======
import { requiresAuth } from 'express-openid-connect';
>>>>>>> f6104f792f2470498a88673daffb7c9f86e567cf

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule],
  controllers: [UsersController,adminController],
  providers: [UsersService],
})
export class UsersModule  {}

