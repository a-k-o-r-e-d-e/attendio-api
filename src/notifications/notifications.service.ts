import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messaging } from 'firebase-admin/messaging';
import * as Firebase from '../config/firebase.config';
import { NotificationType } from '../constants/enums';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { NotificationData } from './interfaces/notification-data.interface';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
    private readonly firebaseMessaging: Messaging = Firebase.FirebaseMessaging;
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly userService: UsersService
  ) {}

  async updateFcmToken(user: User, fcmToken: string) {
    await this.userService.updateFcmToken(user, fcmToken);
    // await this.sendNotification({type: NotificationType.ClassStarted, userId: user.id, fcmToken, title: "Jekomo", data: {}})
  }

  public async sendNotification({
    type,
    user,
    title,
    body = '',
    data,
  }: {
    user: User;
    title: string;
    body?: string;
    data: NotificationData;
    type: NotificationType;
  }) {

    try {
      if (!user.fcm_token) {
        throw new InternalServerErrorException(
          'User passed to fucntion missing fcm_token property',
        );
      }
      const message = {
        token: user.fcm_token,
        data: data,
        notification: { title, body },
      };

      const notificationRecord = this.notificationRepo.create({
        type: type,
        user: { id: user.id },
        title,
        body,
        data,
      });

      await this.notificationRepo.save(notificationRecord);
      const response = await this.firebaseMessaging.send(message);
      console.log(`Successfully sent ${type} notification:`, response);
    } catch (error) {
      console.log(`Error sending ${type} notification:`, error);
      throw new InternalServerErrorException('Error Sending Notification');
    }
  }
}
