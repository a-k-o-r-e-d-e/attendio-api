import { Module } from '@nestjs/common';
import { WebsocketService } from './websocket.service';
import { BaseWSGateway } from './websocket.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [WebsocketService, BaseWSGateway],
  exports: [BaseWSGateway, WebsocketService],
})
export class WebsocketModule {}
