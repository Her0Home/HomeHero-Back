import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data=>this.excludeData(data)));
  }

  excludeData(users){

    if(Array.isArray(users)){
      return users.map(user=> {
        const userResponse = {
          isActive: user.isActive,
          isVerified: user.isVerified,
          role: user.role,
          id: user.id,
          name: user.name,
          isMembresyActive: user.isMembresyActive
        }
        return userResponse;
      })
    }

    const userResponse = {
      isActive: users.isActive,
      isVerified: users.isVerified,
      role: users.role,
      id: users.id,
      name: users.name,
      isMembresyActive: users.isMembresyActive
    }
    return userResponse;

  }
}
