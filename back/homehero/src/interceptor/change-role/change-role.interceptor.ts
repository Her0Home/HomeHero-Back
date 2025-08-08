import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Role } from 'src/users/assets/roles';

@Injectable()
export class ChangeRoleInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

    const req = context.switchToHttp().getRequest();

    const role= req.body.role?.toLowerCase();
    console.log('role: ',role);
    
    for (const roleEnum in  Role){
      if(Role[roleEnum]===role){
        console.log(Role[roleEnum]);
        req.body.role = Role[roleEnum];
      }
    }
    
    return next.handle();
  
  }

}
