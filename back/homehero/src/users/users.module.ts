import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { profesionalController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { requiresAuth } from 'express-openid-connect';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, profesionalController],
  providers: [UsersService],
})
export class UsersModule  implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(requiresAuth()).forRoutes(UsersController);
  }
}
