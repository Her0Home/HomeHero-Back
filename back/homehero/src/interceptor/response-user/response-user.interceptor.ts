import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

@Injectable()
export class ResponseUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (data.user) {
          data.user = this.excludeData(data.user);
        }
        return data;
      }),
    );
  }

  excludeData(users: any) {
    if (Array.isArray(users)) {
      return users.map(user => ({
        isActive: user.isActive,
        isVerified: user.isVerified,
        role: user.role,
        id: user.id,
        name: user.name,
        isMembresyActive: user.isMembresyActive,
      }));
    }

    return {
      isActive: users.isActive,
      isVerified: users.isVerified,
      role: users.role,
      id: users.id,
      name: users.name,
      isMembresyActive: users.isMembresyActive,
    };
  }
}

