import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';
import { buildStudentMock } from '../test/student.factory';
import { RequestWithProfile } from '../auth/interfaces/request-with-user.interface';

describe('NotificationsController', () => {
  let controller: NotificationsController;
   let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            updateFcmToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateFcmToken', () => {
    it('should call notificationsService.updateFcmToken with correct parameters', async () => {
      // Arrange
      const req: RequestWithProfile = {
        user: { user: buildStudentMock() },
      } as any;
      const updateFcmTokenDto: UpdateFcmTokenDto = {
        fcm_token: 'new-fcm-token',
      };

      const updateFcmTokenSpy = jest.spyOn(
        notificationsService,
        'updateFcmToken',
      );

      // Act
      await controller.updateFcmToken(req, updateFcmTokenDto);

      // Assert
      expect(updateFcmTokenSpy).toHaveBeenCalledWith(
        req.user.user,
        'new-fcm-token',
      );
    });

    it('should return an object with message "Successful"', async () => {
      // Arrange
      const req: RequestWithProfile = {
        user: { user: {} },
      } as RequestWithProfile;
      const updateFcmTokenDto: UpdateFcmTokenDto = {
        fcm_token: 'new-fcm-token',
      };

      // Act
      const result = await controller.updateFcmToken(req, updateFcmTokenDto);

      // Assert
      expect(result).toEqual({ message: 'Successful' });
    });
  });
});
