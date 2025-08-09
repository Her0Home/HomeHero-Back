import {
  Controller,
  Get,
  Post,
  Body,
  Param,
<<<<<<< HEAD
  Delete,
=======
>>>>>>> 377f6ebf0ed12320f149e9c5a3009e4c23e068dd
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
<<<<<<< HEAD
  @Post()
=======
>>>>>>> 377f6ebf0ed12320f149e9c5a3009e4c23e068dd
create(@Body() createAppointmentDto: CreateAppointmentDto) {
  return this.appointmentService.createAppointment(createAppointmentDto);
}

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.appointmentService.findOne(id);
  }

 @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('professionalId', new ParseUUIDPipe()) professionalId: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.updateAppointment(id, professionalId, updateAppointmentDto); 
  }

<<<<<<< HEAD
}
=======
}
>>>>>>> 377f6ebf0ed12320f149e9c5a3009e4c23e068dd
