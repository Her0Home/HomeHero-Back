import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseProfesionalInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data=>this.excludeData(data)));
  }

  excludeData(user){

  
    if(Array.isArray(user)){
      return user.map(({ auth0Id,email,birthdate,dni,...rest})=> rest);
    }

    const { auth0Id,email,birthdate,dni,...rest} = user;
    return rest;

  }
}
