import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { Observable } from 'rxjs';
import { Role } from 'src/users/assets/roles';

@Injectable()
export class LogginGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization ) {
       throw new UnauthorizedException('No authorization token provided.');
    }

    const token = authorization.split(' ')[1];

    if (!token) return false;

    try {
          const secret = process.env.JWT_SECRET;
      const user = this.jwtService.verify(token, { secret });

      
      user.exp = new Date(user.exp * 1000);
      user.iat = new Date(user.iat * 1000);

      request.user = user;

      log(user)
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
