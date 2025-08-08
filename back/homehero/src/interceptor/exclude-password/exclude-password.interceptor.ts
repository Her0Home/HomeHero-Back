import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data=>this.excludePassword(data)));
  }

  excludePassword(user){

    if(Array.isArray(user)){
      user.map(({password, ...rest})=> rest)
    }

    const {password, ...rest}= user;
    return rest;

  }
}
