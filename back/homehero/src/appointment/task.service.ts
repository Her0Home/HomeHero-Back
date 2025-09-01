import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppointmentService } from './appointment.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly appointmentService: AppointmentService) {}

  /**
   * Tarea programada que se ejecuta todos los días a medianoche.
   * Su propósito es encontrar citas confirmadas que no se completaron a tiempo,
   * marcarlas como 'incumplidas' y aplicar las penalizaciones correspondientes.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'checkUnfulfilledAppointments',
    timeZone: 'America/Bogota',
  })
  async handleUnfulfilledAppointmentsCron() {
    this.logger.log('Ejecutando tarea programada: Verificando citas incumplidas...');
    try {
      const processedCount = await this.appointmentService.processUnfulfilledAppointments();
      this.logger.log(`Tarea de citas incumplidas finalizada. Se procesaron ${processedCount} citas.`);
    } catch (error) {
      this.logger.error('Ocurrió un error durante la ejecución de la tarea de citas incumplidas.', error.stack);
    }
  }
}