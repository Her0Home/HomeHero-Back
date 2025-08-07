import { Module } from '@nestjs/common';
import { AddresService } from './addres.service';
import { AddresController } from './addres.controller';

@Module({
  controllers: [AddresController],
  providers: [AddresService],
})
export class AddresModule {}
