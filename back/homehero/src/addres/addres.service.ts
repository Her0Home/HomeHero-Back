import { Injectable } from '@nestjs/common';
import { CreateAddreDto } from './dto/create-addre.dto';
import { UpdateAddreDto } from './dto/update-addre.dto';

@Injectable()
export class AddresService {
  create(createAddreDto: CreateAddreDto) {
    return 'This action adds a new addre';
  }

  findAll() {
    return `This action returns all addres`;
  }

  findOne(id: number) {
    return `This action returns a #${id} addre`;
  }

  update(id: number, updateAddreDto: UpdateAddreDto) {
    return `This action updates a #${id} addre`;
  }

  remove(id: number) {
    return `This action removes a #${id} addre`;
  }
}
