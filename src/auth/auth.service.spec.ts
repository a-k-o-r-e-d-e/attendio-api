import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LecturersService } from '../lecturers/lecturers.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, HttpException } from '@nestjs/common';
import {
  buildCreateLecturerDtoMock,
  buildLecturerMock,
} from '../test/lecturer.factory';
import { buildUserMock } from '../test/user.factory';
import { Role } from '../constants/enums';
import { StudentsService } from '../students/students.service';
import {
  buildCreateStudentDtoMock,
  buildStudentMock,
} from '../test/student.factory';

describe('AuthService', () => {
  let service: AuthService;
  let lecturersService: LecturersService;
  let studentsService: StudentsService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: LecturersService,
          useValue: {
            create: jest.fn(),
            getByUsername: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getByUsernameOrEmail: jest.fn(),
          },
        },
        {
          provide: StudentsService,
          useValue: {
            create: jest.fn(),
            findOneByUsername: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    lecturersService = module.get<LecturersService>(LecturersService);
    studentsService = module.get<StudentsService>(StudentsService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerLecturer', () => {
    it('should call lecturerService.create and return created lecturer', async () => {
      const lecturerDto = buildCreateLecturerDtoMock();
      const createdLecturer = buildLecturerMock(); // Provide expected created lecturer object
      jest.spyOn(lecturersService, 'create').mockResolvedValue(createdLecturer);

      const result = await service.registerLecturer(lecturerDto);

      expect(lecturersService.create).toHaveBeenCalledWith(lecturerDto);
      expect(result).toBe(createdLecturer);
    });

    it('should throw BadRequestException if lecturer with provided email/username already exists', async () => {
      const lecturerDto = buildCreateLecturerDtoMock();
      jest
        .spyOn(lecturersService, 'create')
        .mockRejectedValue({ code: '23505' });

      await expect(service.registerLecturer(lecturerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error/exception if an unexpected error occurs', async () => {
      const lecturerDto = buildCreateLecturerDtoMock();
      jest.spyOn(lecturersService, 'create').mockRejectedValue(new Error());

      await expect(service.registerLecturer(lecturerDto)).rejects.toThrow();
    });
  });

  describe('registerStudent', () => {
    it('should call studentService.create and return created student', async () => {
      const studentDto = buildCreateStudentDtoMock();
      const createdStudent = buildStudentMock();
      jest.spyOn(studentsService, 'create').mockResolvedValue(createdStudent);

      const result = await service.registerStudent(studentDto);

      expect(studentsService.create).toHaveBeenCalledWith(studentDto);
      expect(result).toBe(createdStudent);
    });

    it('should throw BadRequestException if student with provided email/username already exists', async () => {
      const studentDto = buildCreateStudentDtoMock();
      jest
        .spyOn(studentsService, 'create')
        .mockRejectedValue({ code: '23505' });

      await expect(service.registerStudent(studentDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error/exception if an unexpected error occurs', async () => {
      const studentDto = buildCreateStudentDtoMock();
      jest.spyOn(studentsService, 'create').mockRejectedValue(new Error());

      await expect(service.registerStudent(studentDto)).rejects.toThrow();
    });
  });

  describe('validateUser', () => {
    it('should call usersService.getByUsernameOrEmail and verifyPassword', async () => {
      const emailOrUsername = 'test-username';
      const plainTextPassword = '';
      const user = buildUserMock({ username: emailOrUsername });
      jest.spyOn(usersService, 'getByUsernameOrEmail').mockResolvedValue(user);
      const verifyPasswordSpy = jest
        .spyOn(service as any, 'verifyPassword')
        .mockResolvedValue(undefined);

      await service.validateUser(emailOrUsername, plainTextPassword);

      expect(usersService.getByUsernameOrEmail).toHaveBeenCalledWith(
        emailOrUsername,
      );
      expect(verifyPasswordSpy).toHaveBeenCalledWith(
        plainTextPassword,
        user.password,
      );
    });

    it('should throw BadRequestException if wrong credentials provided', async () => {
      const emailOrUsername = 'test-username';
      const wrongPassword = 'wrong-password';
      const user = buildUserMock({ username: emailOrUsername });
      jest.spyOn(usersService, 'getByUsernameOrEmail').mockResolvedValue(user);

      await expect(
        service.validateUser(emailOrUsername, wrongPassword),
      ).rejects.toThrow(new BadRequestException('Wrong credentials provided'));
    });
  });

  describe('login', () => {
    it('should call getProfile and jwtService.signAsync', async () => {
      const user = buildUserMock({ roles: [Role.Lecturer] });
      const lecturer = buildLecturerMock();
      jest.spyOn(service, 'getProfile').mockResolvedValue(lecturer);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('');

      await service.login(user, Role.Lecturer);

      expect(service.getProfile).toHaveBeenCalledWith(
        user.username,
        Role.Lecturer,
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user is not of specified type', async () => {
      const user = buildUserMock({ roles: [Role.Lecturer] });
      await expect(service.login(user, Role.Student)).rejects.toThrow(
        new BadRequestException(
          `Authentication Failed: User is not a ${Role.Student}`,
        ),
      );
    });
  });

  describe('getProfile', () => {
    it('should call lecturerService.getByUsername', async () => {
      const username = 'test-username';
      const lecturer = buildLecturerMock({ user: { username } });
      jest.spyOn(lecturersService, 'getByUsername').mockResolvedValue(lecturer);

      await service.getProfile(username, Role.Lecturer);

      expect(lecturersService.getByUsername).toHaveBeenCalledWith(username);
    });

    it('should throw HttpStatus.EXPECTATION_FAILED if userType is not implemented', async () => {
      const username = ''; // Provide appropriate username
      await expect(service.getProfile(username, Role.Admin)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
