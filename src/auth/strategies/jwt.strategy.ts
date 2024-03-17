import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import EnvVars from 'src/constants/EnvVars';
import { AuthService } from '../auth.service';
import JwtPayload from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: EnvVars.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return await this.authService.getProfile(payload.username, payload.user_type);
  }
}
