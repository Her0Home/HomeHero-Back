import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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

}
