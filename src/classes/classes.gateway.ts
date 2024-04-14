import {
  ClassSerializerInterceptor,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Roles } from '../auth/role.decorator';
import { Role } from '../constants/enums';
import { WsJwtGuard } from '../auth/guards/ws-jwt-auth.guard';
import RolesGuard from '../auth/guards/role.guard';
import { BaseWSGateway } from '../websocket/websocket.gateway';
import { WebsocketService } from '../websocket/websocket.service';
import { ClassesService } from './classes.service';
import { StartClassDto } from './dto/start-class.dto';
import { HttpExceptionTransformationFilter } from '../websocket/filters/ws-exception.filter';
import { Socket } from 'socket.io';
import WsEvents from 'src/constants/websocket-events';

@WebSocketGateway()
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(HttpExceptionTransformationFilter)
export class ClassesGateway extends BaseWSGateway {
  constructor(
    private readonly wSService: WebsocketService,
    private readonly classesService: ClassesService,
  ) {
    super(wSService);
  }

  @Roles(Role.Lecturer)
  @UseGuards(WsJwtGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.StartClass)
  async handleStartClass(
    @ConnectedSocket() socket: Socket,
    @MessageBody() startClassDto: StartClassDto,
  ) {
    return await this.classesService.startClass(
      startClassDto.class_instance_id,
      socket,
    );
  }

  @Roles(Role.Student)
  @UseGuards(WsJwtGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.JoinClass)
  async handleJoinClass(
    @ConnectedSocket() socket: Socket,
    @MessageBody() startClassDto: StartClassDto,
  ) {
    await this.classesService.joinClass(
      socket,
      (socket.request as any).user,
      startClassDto.class_instance_id,
    );

    return {
      message: 'Successful',
    };
  }
}
