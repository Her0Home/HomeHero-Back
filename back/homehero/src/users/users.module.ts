import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { profesionalController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, profesionalController],
  providers: [UsersService],
})
export class UsersModule {}
