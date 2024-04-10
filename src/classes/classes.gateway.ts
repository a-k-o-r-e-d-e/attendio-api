import { UseGuards } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Roles } from 'src/auth/role.decorator';
import { Role } from 'src/constants/enums';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import RolesGuard from 'src/auth/guards/role.guard';
import { BaseWSGateway } from 'src/websocket/websocket.gateway';

@WebSocketGateway()
export class ClassesGateway extends BaseWSGateway {
  @Roles(Role.Lecturer)
  @UseGuards(WsJwtGuard, RolesGuard)
  @SubscribeMessage('start-class')
  handleMessage(@MessageBody('class_instance_id') class_instance_id: string) {
    return {
      message: 'Hello world!',
      payload: { class_instance_id },
    };
  }
}
