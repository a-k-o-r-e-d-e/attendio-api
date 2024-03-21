import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  buildCreateLecturerDtoMock,
  buildLecturerMock,
} from '../test/lecturer.factory';
import { buildUserMock } from '../test/user.factory';
import { Role } from '../constants/enums';
import { buildLoginDTOMock } from '../test/auth.factory';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            registerLecturer: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerLecturer', () => {
    it('should call authService.registerLecturer with the provided lecturerDto', async () => {
      const createLecturerDto = buildCreateLecturerDtoMock();

      await controller.registerLecturer(createLecturerDto);

      expect(authService.registerLecturer).toHaveBeenCalledWith(
        createLecturerDto,
      );
    });

    it('should register a new lecturer', async () => {
      const createLecturerDto = buildCreateLecturerDtoMock();
      const createdLecturer = buildLecturerMock(createLecturerDto);

      jest
        .spyOn(authService, 'registerLecturer')
        .mockResolvedValueOnce(createdLecturer);

      const result = await controller.registerLecturer(createLecturerDto);

      expect(authService.registerLecturer).toHaveBeenCalledWith(
        createLecturerDto,
      );
      expect(result).toEqual(createdLecturer);
    });
  });

  describe('login', () => {
    it('should call authService.login with the user and userType from request', async () => {
      const request = {
        user: buildUserMock(),
        body: {
          emailOrUsername: 'test@example.com',
          password: 'password',
          user_type: Role.Lecturer,
        },
      };

      await controller.login(request as any, request.body);

      expect(authService.login).toHaveBeenCalledWith(
        request.user,
        Role.Lecturer,
      );
    });

    it('should log in a user', async () => {
      const request = {
        user: buildUserMock(),
      } as any;
      const loginDto = buildLoginDTOMock();
      const accessToken = 'mockAccessToken';
      const lecturer = buildLecturerMock();
      jest
        .spyOn(authService, 'login')
        .mockResolvedValueOnce({
          access_token: accessToken,
          profile: lecturer,
        });

      const result = await controller.login(request, loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        request.user,
        loginDto.user_type,
      );
      expect(result).toEqual({ access_token: accessToken, profile: lecturer });
    });
  });
});
