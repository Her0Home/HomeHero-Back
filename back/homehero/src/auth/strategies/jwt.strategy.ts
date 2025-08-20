import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const secretKey = configService.get<string>('SECRET_KEY');

    if (!secretKey) {
      throw new Error('SECRET_KEY no está definido en las variables de entorno');
    }
 
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: Request) => {
          return request?.cookies?.auth_token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }
  async validate(payload: any): Promise<User> {

    const user = await this.userRepository.findOne({ 
      where: { id: payload.sub || payload.id } 
    });
    

    if (!user) {
      throw new UnauthorizedException('Token inválido o usuario no existe.');
    }
    

    delete user.password;
    return user;
  }
}