import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CronGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const cronSecret = this.configService.get<string>('CRON_SECRET');
    const authHeader = request.headers['authorization'];


    if (!cronSecret) {
        console.error('La variable de entorno CRON_SECRET no está configurada en el servidor.');
        throw new UnauthorizedException();
    }


    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      throw new UnauthorizedException('Clave secreta para el cron job inválida o ausente.');
    }

    return true;
  }
}