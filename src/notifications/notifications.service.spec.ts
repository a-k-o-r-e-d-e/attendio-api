import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Notification } from './entities/notification.entity';
import { buildUserMock } from '../test/user.factory';
import { NotificationData } from './interfaces/notification-data.interface';
import { NotificationType } from '../constants/enums';
import { buildNotificationMock } from '../test/notification.factory';
import { InternalServerErrorException } from '@nestjs/common';
import { Messaging } from 'firebase-admin/messaging';

jest.mock('firebase-admin', () => ({
  ...jest.mock('firebase-admin'),
  credential: {
    cert: jest.fn(),
  },
  initializeApp: jest.fn(),
}));

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn().mockReturnValueOnce({
    send: jest.fn(),
  }),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepo: Repository<Notification>;
  let usersService: UsersService;
  let firebaseMessaging: Messaging;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useClass: Repository,
        },
        {
          provide: UsersService,
          useValue: {
            updateFcmToken: jest.fn(),
          },
        },
        // {
        //   provide: Messaging,
        //   useValue: {
        //     send: jest.fn(),
        //   },
        // },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepo = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateFcmToken', () => {
    it('should update the FCM token for the user', async () => {
      const user = buildUserMock(); // Create a user instance for testing
      const fcmToken = 'new-fcm-token';

      jest
        .spyOn(usersService, 'updateFcmToken')
        .mockResolvedValueOnce({ ...user, fcm_token: fcmToken });

      await service.updateFcmToken(user, fcmToken);

      expect(usersService.updateFcmToken).toHaveBeenCalledWith(user, fcmToken);
    });
  });

  describe('sendNotification', () => {
    it('should send a notification successfully', async () => {
      const user = buildUserMock({ id: 'user-id' });
      const title = 'Notification Title';
      const body = 'Notification Body';
      const data: NotificationData = { message: 'value' };
      const type = NotificationType.ClassStarted;

      const notificationMock = buildNotificationMock();

      jest
        .spyOn(notificationRepo, 'create')
        .mockReturnValueOnce(notificationMock);
      jest
        .spyOn(notificationRepo, 'save')
        .mockResolvedValueOnce(notificationMock);
      jest
        .spyOn((service as any).firebaseMessaging, 'send')
        .mockResolvedValueOnce({});

      await service.sendNotification({
        user,
        title,
        body,
        data,
        type,
      });

      expect(notificationRepo.save).toHaveBeenCalled();
      expect((service as any).firebaseMessaging.send).toHaveBeenCalled();
    });

    it('should throw an InternalServerErrorException if sending notification fails', async () => {
      const user = buildUserMock({id: 'user-id'});
      const title = 'Notification Title';
      const body = 'Notification Body';
      const data: NotificationData = { message: 'value' };
      const type = NotificationType.ClassStarted;
      const errorMessage = 'Error sending notification';

      let notificationMock = buildNotificationMock();

      jest
        .spyOn(notificationRepo, 'create')
        .mockReturnValueOnce(notificationMock);
      jest
        .spyOn(notificationRepo, 'save')
        .mockResolvedValueOnce(notificationMock);
      jest
        .spyOn((service as any).firebaseMessaging, 'send')
        .mockRejectedValueOnce(new Error(errorMessage));

      try {
        await service.sendNotification({
          user,
          title,
          body,
          data,
          type,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Error Sending Notification');
      }
    });
  });
});
