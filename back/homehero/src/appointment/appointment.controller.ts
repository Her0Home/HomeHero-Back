import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {  LogginGuard } from 'src/guards/loggin.guard';
import { Roles } from 'src/decorators/role.decorator';
import { Role } from 'src/users/assets/roles';
import { RolesGuard } from 'src/guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FinishAppointmentDto } from './dto/finish-appointment.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('availability/:professionalId/:date')
  @ApiBearerAuth()
  @UseGuards(LogginGuard) 
  getAvailability(
    @Param('professionalId', new ParseUUIDPipe()) professionalId: string,
    @Param('date') date: string,
  ) {
    return this.appointmentService.getAvailability(professionalId, date);
  }

  @Post()
  @UseGuards(LogginGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('imageFile')) 
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 5242880, // 5MB, 
            message: 'El tamaño máximo es de 5 MB.',
          }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp)$/,
          }),
        ],
        fileIsRequired: false, 
      }),
    )
    imageFile?: Express.Multer.File, 
  ) {
    return this.appointmentService.createAppointment(createAppointmentDto, imageFile);
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
  @Put('confirm/:id')
  @ApiBearerAuth()
  @UseGuards(LogginGuard)
  confirm(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('professionalId', new ParseUUIDPipe()) professionalId: string,
  ) {
    return this.appointmentService.confirmAppointment(id, professionalId);
  }

 @Put('reschedule/:id')
  @ApiBearerAuth()
  @UseGuards(LogginGuard)
  reschedule(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() rescheduleDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.rescheduleAppointment(id, rescheduleDto);
  }
  
  @Put('cancel/:id')
  @ApiBearerAuth()
  @UseGuards(LogginGuard)
  cancel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body('userId', new ParseUUIDPipe()) userId: string, 
  ) {
    return this.appointmentService.cancelAppointment(id, userId);
  }
  @Post('finish/:id')
  @ApiBearerAuth()
  @UseGuards(LogginGuard) 
  finish(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() finishDto: FinishAppointmentDto,
  ) {
    return this.appointmentService.finishAppointment(id, finishDto);
  }
}
