import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let socket: Socket;
    try {
      socket = context.switchToWs().getClient<Socket>();
      let auth_token: string = socket.handshake.headers.authorization;
      auth_token = auth_token.split(' ')[1];
      const profile = await this.authService.getProfileFromAuthToken(auth_token);

      if (!profile) {
        socket.disconnect();
      }
      context.switchToHttp().getRequest().user = profile;
      return Boolean(profile);
    } catch (err) {
      if (socket) {
        socket.disconnect();
      }
      throw new WsException(err.message);
    }
  }
}
