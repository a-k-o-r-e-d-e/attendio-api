import '../test/mocks/firebase.mock';
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
import { buildInstitutionMock } from '../test/institution.factory';
import {
  buildCreateStudentDtoMock,
  buildStudentMock,
} from '../test/student.factory';

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
            registerStudent: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
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
      const createdLecturer = buildLecturerMock({
        ...createLecturerDto,
        institution: buildInstitutionMock({
          id: createLecturerDto.institution,
        }),
      });

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

  describe('registerStudent', () => {
    it('should call authService.registerStudent with the provided studentDto', async () => {
      const createStudentDto = buildCreateStudentDtoMock();

      await controller.registerStudent(createStudentDto);

      expect(authService.registerStudent).toHaveBeenCalledWith(
        createStudentDto,
      );
    });

    it('should register a new student', async () => {
      const createStudentDto = buildCreateStudentDtoMock();
      const createdStudent = buildStudentMock({
        ...createStudentDto,
        institution: buildInstitutionMock({
          id: createStudentDto.institution,
        }),
      });

      jest
        .spyOn(authService, 'registerStudent')
        .mockResolvedValueOnce(createdStudent);

      const result = await controller.registerStudent(createStudentDto);

      expect(authService.registerStudent).toHaveBeenCalledWith(
        createStudentDto,
      );
      expect(result).toEqual(createdStudent);
    });
  });

  describe('login', () => {
    it('should call authService.login with the user and userType from request', async () => {
      const loginDto = buildLoginDTOMock({
        emailOrUsername: 'test@example.com',
        password: 'password',
        user_type: Role.Lecturer,
        fcm_token: 'random-token',
      });
      const request = {
        user: buildUserMock(),
      };

      await controller.login(request as any, loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        request.user,
        Role.Lecturer,
        loginDto.fcm_token,
      );
    });

    it('should log in a user', async () => {
      const request = {
        user: buildUserMock(),
      } as any;
      const loginDto = buildLoginDTOMock();
      const accessToken = 'mockAccessToken';
      const lecturer = buildLecturerMock();
      jest.spyOn(authService, 'login').mockResolvedValueOnce({
        access_token: accessToken,
        profile: lecturer,
      });

      const result = await controller.login(request, loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        request.user,
        loginDto.user_type,
        loginDto.fcm_token,
      );
      expect(result).toEqual({ access_token: accessToken, profile: lecturer });
    });
  });

  describe('authenticate', () => {
    it('should authenticate user', async () => {
      const student = buildStudentMock();
      const req = {
        user: student,
      } as any;
      const sample_token = 'sample_token';

      const loginResult = {
        access_token: 'mockAccessToken',
        profile: student,
      };
      jest.spyOn(authService, 'login').mockResolvedValueOnce(loginResult);

      const result = await controller.authenticate(req, {
        fcm_token: sample_token,
      });

      expect(result).toBe(loginResult);
      expect(authService.login).toHaveBeenCalledWith(
        req.user.user,
        Role.Student,
        sample_token,
      );
    });
  });
});
