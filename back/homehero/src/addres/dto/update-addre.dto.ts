import { PartialType } from '@nestjs/swagger';
import { CreateAddreDto } from './create-addre.dto';

export class UpdateAddreDto extends PartialType(CreateAddreDto) {}
