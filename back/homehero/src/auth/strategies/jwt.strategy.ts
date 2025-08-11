import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });


  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({ 
      where: { id: payload.sub || payload.id } 
    });
    
    if (!user) {
      return null;
    }
    
    const { password, ...result } = user;
    return result;
  }
}