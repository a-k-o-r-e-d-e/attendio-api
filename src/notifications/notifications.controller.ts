import { Body, Controller, Param, Put, Req, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { RequestWithProfile } from '../auth/interfaces/request-with-user.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Put('fcm-token')
  async updateFcmToken(
    @Req() req: RequestWithProfile,
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
  ) {
    await this.notificationsService.updateFcmToken(
      req.user.user,
      updateFcmTokenDto.fcm_token,
    );
    return {
      message: 'Successful',
    };
  }
}
