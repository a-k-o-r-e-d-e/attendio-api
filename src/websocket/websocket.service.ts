import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class WebsocketService {
  constructor(private readonly authService: AuthService) {}
  async getProfileFromSocket(socket: Socket) {
    try {
      let auth_token = socket.handshake.headers.authorization;
      // get the token itself without "Bearer"
      auth_token = auth_token.split(' ')[1];
      const user = this.authService.getProfileFromAuthToken(auth_token);

      if (!user) {
        socket.disconnect();
      }
      return user;
    } catch (err) {
      socket.disconnect();
      // throw new WsException('Authentication failed');
    }
  }
}
