import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from 'src/users/assets/roles';

@Injectable()
export class VerifyRoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const req: Request = context.switchToHttp().getRequest()

    const rol: string = req.body.role

    if(rol === Role.ADMIN){
      throw new BadRequestException (`El rol ${rol}, no es asignable, por favor eliga entre cliente o profesional`);
    }

    return true;

  }

  
}
