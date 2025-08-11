import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {  LogginGuard } from 'src/guards/loggin.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/users/assets/roles';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
<<<<<<< HEAD
=======
  @UseGuards(LogginGuard)
>>>>>>> e81dcabc5ed54eff0cd75e6840387296097e43b9
create(@Body() createAppointmentDto: CreateAppointmentDto) {
  return this.appointmentService.createAppointment(createAppointmentDto);
}

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(LogginGuard,RolesGuard)
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
