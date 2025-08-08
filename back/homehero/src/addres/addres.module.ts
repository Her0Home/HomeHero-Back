import { Module } from '@nestjs/common';
import { AddresService } from './addres.service';
import { AddresController } from './addres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Addre } from './entities/addre.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Addre, User])],
  controllers: [AddresController],
  providers: [AddresService],
})
export class AddresModule {}
