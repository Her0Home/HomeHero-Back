import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersServiceSeeder } from './seedersUser.service';
import { User } from 'src/users/entities/user.entity';


@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [UsersServiceSeeder],
})
export class SeederModule {}
