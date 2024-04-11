import { ClassSerializerInterceptor, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import {
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
  @SubscribeMessage('start-class')
  async handleStartClass(@MessageBody() startClassDto: StartClassDto) {
    return await this.classesService.startClass(
      startClassDto.class_instance_id,
    );
  }
}
