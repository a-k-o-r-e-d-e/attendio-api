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
import { ClassInstanceWsEventDto } from './dto/class-instance-ws-event.dto';
import { HttpExceptionTransformationFilter } from '../websocket/filters/ws-exception.filter';
import { Socket } from 'socket.io';
import WsEvents from '../constants/websocket-events';

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
    @MessageBody() classWsEventDto: ClassInstanceWsEventDto,
  ) {
    return await this.classesService.startClass(
      classWsEventDto.class_instance_id,
      socket,
    );
  }

  @Roles(Role.Lecturer)
  @UseGuards(WsJwtGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.EndClass)
  async handleEndClass(
    @ConnectedSocket() socket: Socket,
    @MessageBody() classWsEventDto: ClassInstanceWsEventDto,
  ) {
    await this.classesService.endClass(
      socket,
      classWsEventDto.class_instance_id,
      (socket.request as any).user,
    );

    return {
      event: WsEvents.EndClassAck,
      data: {
        message: 'Successful',
      },
    };
  }

  @Roles(Role.Student)
  @UseGuards(WsJwtGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.JoinClass)
  async handleJoinClass(
    @ConnectedSocket() socket: Socket,
    @MessageBody() classWsEventDto: ClassInstanceWsEventDto,
  ) {
    return await this.classesService.joinClass(
      socket,
      (socket.request as any).user,
      classWsEventDto.class_instance_id,
    );
  }

  @Roles(Role.Student)
  @UseGuards(WsJwtGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.MarkAttendance)
  async handleMarkAttendance(
    @ConnectedSocket() socket: Socket,
    @MessageBody() classWsEventDto: ClassInstanceWsEventDto,
  ) {
    return await this.classesService.markAttendance(
      socket,
      (socket.request as any).user,
      classWsEventDto.class_instance_id,
    );
  }

  @Roles(Role.Lecturer)
  @UseGuards(WsJwtGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.TakeAttendance)
  async handleTakeAttendance(
    @ConnectedSocket() socket: Socket,
    @MessageBody() classWsEventDto: ClassInstanceWsEventDto,
  ) {
    return await this.classesService.takeAttendance(
      socket,
      classWsEventDto.class_instance_id,
      (socket.request as any).user,
    );
  }

  @Roles(Role.Lecturer)
  @UseGuards(WsJwtGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.HaltAttendance)
  async handleHaltAttendance(
    @ConnectedSocket() socket: Socket,
    @MessageBody() classWsEventDto: ClassInstanceWsEventDto,
  ) {
    return await this.classesService.stopTakingAttendance(
      socket,
      classWsEventDto.class_instance_id,
      (socket.request as any).user,
    );
  }

  @UseGuards(WsJwtGuard)
  @UsePipes(new ValidationPipe())
  @SubscribeMessage(WsEvents.FetchOnGoingClass)
  async handleFetchOngoingClass(
    @MessageBody() classWsEventDto: ClassInstanceWsEventDto,
  ) {
    return await this.classesService.fetchOnGoingClass(
      classWsEventDto.class_instance_id,
    );
  }
}
