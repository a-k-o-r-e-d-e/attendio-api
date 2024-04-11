import { ClassSerializerInterceptor, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
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
import { WebsocketService } from 'src/websocket/websocket.service';
import { ClassesService } from './classes.service';
import { StartClassDto } from './dto/start-class.dto';
import { HttpExceptionTransformationFilter } from 'src/websocket/filters/ws-exception.filter';

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
  async handleMessage(@MessageBody() startClassDto: StartClassDto) {
    return await this.classesService.startClass(
      startClassDto.class_instance_id,
    );
  }
}
