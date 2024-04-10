import { OnGatewayConnection } from '@nestjs/websockets';
import { WebsocketService } from './websocket.service';
import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseWSGateway implements OnGatewayConnection {
  constructor(private readonly wsService: WebsocketService) {}

  async handleConnection(socket: Socket) {
    await this.wsService.getProfileFromSocket(socket);
  }
}
