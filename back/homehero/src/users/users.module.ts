import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { adminController, profesionalController, UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, profesionalController,adminController],
  providers: [UsersService],
})
export class UsersModule {}
