import '../test/mocks/firebase.mock';
import { ClassesService } from './classes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseClass } from './entities/course-class.entity';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesService } from '../courses/courses.service';
import {
  buildClassInstanceMock,
  buildCourseClassMock,
  buildOnGoingClassMock,
} from '../test/course-class.factory';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { TestBed } from '@automock/jest';
import { ClassStatus } from '../constants/enums';
import {
  buildCourseMock,
  buildStudentCourseEnrollmentMock,
} from '../test/course.factory';
import { NotificationsService } from '../notifications/notifications.service';
import { AttendanceService } from '../attendance/attendance.service';
import { Socket } from 'socket.io';
import { OnGoingingClassInstance } from './entities/ongoing-class-instance.entity';
import { buildStudentMock } from '../test/student.factory';
import { WsException } from '@nestjs/websockets';
import { buildLecturerMock } from '../test/lecturer.factory';
import { buildAttendanceMock } from '../test/attendance.factory';

describe('ClassesService', () => {
  let service: ClassesService;
  let courseClassRepo: Repository<CourseClass>;
  let classInstanceRepo: Repository<ClassInstance>;
  let coursesService: CoursesService;
  let notificationsService: NotificationsService;
  let attendanceService: AttendanceService;
  let onGoingClassRepo: Repository<OnGoingingClassInstance>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(ClassesService).compile();

    service = unit;
    courseClassRepo = unitRef.get(getRepositoryToken(CourseClass) as string);
    classInstanceRepo = unitRef.get(
      getRepositoryToken(ClassInstance) as string,
    );
    coursesService = unitRef.get(CoursesService);
    notificationsService = unitRef.get(NotificationsService);
    attendanceService = unitRef.get(AttendanceService);
    onGoingClassRepo = unitRef.get(
      getRepositoryToken(OnGoingingClassInstance) as string,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCourseClasses', () => {
    it('should find all course classes when no whereClause is provided', async () => {
      // Arrange
      const expectedCourseClasses: CourseClass[] = [
        buildCourseClassMock(),
        buildCourseClassMock(),
      ];
      jest
        .spyOn(courseClassRepo, 'findBy')
        .mockResolvedValueOnce(expectedCourseClasses);

      // Act
      const result = await service.findAllCourseClasses();

      // Assert
      expect(result).toEqual(expectedCourseClasses);
      expect(courseClassRepo.findBy).toHaveBeenCalledWith(undefined);
    });

    it('should find course classes with a provided whereClause', async () => {
      // Arrange
      const whereClause = {
        /* Add your whereClause here */
      };
      const expectedCourseClasses: CourseClass[] = [
        buildCourseClassMock(),
        buildCourseClassMock(),
      ];
      jest
        .spyOn(courseClassRepo, 'findBy')
        .mockResolvedValueOnce(expectedCourseClasses);

      // Act
      const result = await service.findAllCourseClasses(whereClause);

      // Assert
      expect(result).toEqual(expectedCourseClasses);
      expect(courseClassRepo.findBy).toHaveBeenCalledWith(whereClause);
    });
  });

  describe('findAllClassInstances', () => {
    it('should find all class instances when no whereClause is provided', async () => {
      // Arrange
      const expectedClassInstances = [
        buildClassInstanceMock(),
        buildClassInstanceMock(),
      ];
      jest
        .spyOn(classInstanceRepo, 'findBy')
        .mockResolvedValueOnce(expectedClassInstances);

      // Act
      const result = await service.findAllClassInstances();

      // Assert
      expect(result).toEqual(expectedClassInstances);
      expect(classInstanceRepo.findBy).toHaveBeenCalledWith(undefined);
    });

    it('should find course classes with a provided whereClause', async () => {
      // Arrange
      const whereClause = {};
      const expectedClassInstances = [
        buildClassInstanceMock(),
        buildClassInstanceMock(),
      ];
      jest
        .spyOn(classInstanceRepo, 'findBy')
        .mockResolvedValueOnce(expectedClassInstances);

      // Act
      const result = await service.findAllClassInstances(whereClause);

      // Assert
      expect(result).toEqual(expectedClassInstances);
      expect(classInstanceRepo.findBy).toHaveBeenCalledWith(whereClause);
    });
  });

  describe('findOneCourseClass', () => {
    it('should return a course class when found', async () => {
      const courseClassId = '123';
      const expectedCourseClass = buildCourseClassMock();
      jest
        .spyOn(courseClassRepo, 'findOneBy')
        .mockResolvedValue(expectedCourseClass);

      const result = await service.findOneCourseClass({ id: courseClassId });

      expect(result).toEqual(expectedCourseClass);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });

    it('should throw NotFoundException when course class is not found', async () => {
      const courseClassId = '123';
      jest.spyOn(courseClassRepo, 'findOneBy').mockResolvedValue(undefined);

      await expect(
        service.findOneCourseClass({ id: courseClassId }),
      ).rejects.toThrow(NotFoundException);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });
  });

  describe('findOneCourseClassById', () => {
    it('should return a course class when found', async () => {
      const courseClassId = '123';
      const expectedCourseClass = buildCourseClassMock();
      jest
        .spyOn(courseClassRepo, 'findOneBy')
        .mockResolvedValue(expectedCourseClass);

      const result = await service.findOneCourseClassById(courseClassId);

      expect(result).toEqual(expectedCourseClass);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });

    it('should throw NotFoundException when course class is not found', async () => {
      const courseClassId = '123';
      jest.spyOn(courseClassRepo, 'findOneBy').mockResolvedValue(undefined);

      await expect(
        service.findOneCourseClassById(courseClassId),
      ).rejects.toThrow(NotFoundException);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });
  });

  describe('remove', () => {
    it('should remove a course class when found', async () => {
      const courseClassId = '123';
      const expectedCourseClass = buildCourseClassMock();
      jest
        .spyOn(service, 'findOneCourseClassById')
        .mockResolvedValue(expectedCourseClass);
      jest.spyOn(courseClassRepo, 'delete').mockResolvedValueOnce(undefined);

      await service.remove(courseClassId);

      expect(courseClassRepo.delete).toHaveBeenCalledWith(courseClassId);
    });

    it('should throw NotFoundException when course class is not found', async () => {
      const courseClassId = '123';
      jest
        .spyOn(service, 'findOneCourseClassById')
        .mockResolvedValue(undefined);

      await expect(service.remove(courseClassId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('startClass', () => {
    it('should start class and send notifications to students', async () => {
      // Arrange
      const classInstance = buildClassInstanceMock({
        status: ClassStatus.Pending,
      });

      const ongoingClassInstance = buildOnGoingClassMock();

      const students = [buildStudentCourseEnrollmentMock()];

      const socket: Socket = {
        join: jest.fn(),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValue(classInstance);

      jest
        .spyOn(onGoingClassRepo, 'findOneBy')
        .mockResolvedValue(ongoingClassInstance);
      jest
        .spyOn(coursesService, 'fetchStudentEnrollments')
        .mockResolvedValue(students);
      jest
        .spyOn(socket, 'join')
        .mockResolvedValue(undefined)
        .mockReturnValue(undefined);

      // Act
      await service.startClass('classInstanceId', socket);

      // Assert
      expect(classInstance.status).toEqual(ClassStatus.OnGoinging);
      expect(coursesService.fetchStudentEnrollments).toHaveBeenCalledWith(
        { courseId: classInstance.base.course.id },
        ['user.fcm_token'],
      );
      expect(notificationsService.sendNotification).toHaveBeenCalled();
      expect(attendanceService.populateAttendanceRecords).toHaveBeenCalled();
    });

    it('should throw ConflictException if class status is Held', async () => {
      // Arrange
      const classInstance = buildClassInstanceMock({
        status: ClassStatus.Held,
      });

      const socket: Socket = {
        join: jest.fn(),
      } as any;

      jest
        .spyOn(socket, 'join')
        .mockResolvedValue(undefined)
        .mockReturnValue(undefined);

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValue(classInstance);

      // Act & Assert
      await expect(
        service.startClass('classInstanceId', socket),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('endClass', () => {
    it('should end class and send notifications to students', async () => {
      // Arrange
      const classInstance = buildClassInstanceMock({
        status: ClassStatus.OnGoinging,
      });
      const lecturer = buildLecturerMock();
      const ongoingClassInstance = buildOnGoingClassMock();

      const students = [buildStudentCourseEnrollmentMock()];

      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValue(classInstance);

      jest
        .spyOn(onGoingClassRepo, 'findOneBy')
        .mockResolvedValue(ongoingClassInstance);
      jest
        .spyOn(coursesService, 'fetchStudentEnrollments')
        .mockResolvedValue(students);
      jest
        .spyOn(socket, 'join')
        .mockResolvedValue(undefined)
        .mockReturnValue(undefined);

      // Act
      await service.endClass(socket, 'classInstanceId', lecturer);

      // Assert
      expect(classInstance.status).toEqual(ClassStatus.Held);
      expect(coursesService.fetchStudentEnrollments).toHaveBeenCalledWith(
        { courseId: classInstance.base.course.id },
        ['user.fcm_token'],
      );
      expect(notificationsService.sendNotification).toHaveBeenCalled();
    });

    it('should throw ConflictException if class status is Held', async () => {
      // Arrange
      const classInstance = buildClassInstanceMock({
        status: ClassStatus.Held,
      });
      const lecturer = buildLecturerMock();
      const socket: Socket = {
        join: jest.fn(),
      } as any;

      jest
        .spyOn(socket, 'join')
        .mockResolvedValue(undefined)
        .mockReturnValue(undefined);

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValue(classInstance);

      // Act & Assert
      await expect(
        service.endClass(socket, 'classInstanceId', lecturer),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw UnauthorizedException if lecturer is not the owner of class', async () => {
      // Arrange
      const classInstanceId = 'classInstanceId';
      const lecturer = buildLecturerMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.OnGoinging,
        base: buildCourseClassMock({
          course: buildCourseMock({
            lecturer: buildLecturerMock({ id: 'another-id' }),
          }),
        }),
      });
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);

      // Act & Assert
      await expect(
        service.endClass(socket, classInstanceId, lecturer),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('joinClass', () => {
    it('should join class', async () => {
      // Arrange
      const classInstanceId = 'mock-id';
      const student = buildStudentMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.OnGoinging,
      });
      const studentEnrollment = buildStudentCourseEnrollmentMock({ student });
      const students = [buildStudentCourseEnrollmentMock()];
      const ongoingClassInstance = buildOnGoingClassMock();
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValue(classInstance);
      jest
        .spyOn(coursesService, 'findOneStudentEnrollment')
        .mockResolvedValue(studentEnrollment);

      jest
        .spyOn(coursesService, 'fetchStudentEnrollments')
        .mockResolvedValue(students);
      jest
        .spyOn(onGoingClassRepo, 'findOneBy')
        .mockResolvedValue(ongoingClassInstance);

      // Act
      await service.joinClass(socket, student, classInstanceId);

      // Assert
      // Verify that appropriate methods are called
      expect(service.findOneClassInstanceById).toHaveBeenCalledWith(
        classInstanceId,
      );
      expect(coursesService.findOneStudentEnrollment).toHaveBeenCalled();
    });

    it('should throw WsException if class status is not OnGoinging', async () => {
      // Arrange
      const classInstanceId = 'mock-id';
      const student = buildStudentMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.Pending,
      });
      const socket: Socket = {
        join: jest.fn(),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValue(classInstance);

      // Act & Assert
      await expect(
        service.joinClass(socket, student, classInstanceId),
      ).rejects.toThrow(WsException);
    });
  });

  describe('takeAttendance', () => {
    it('should take attendance successfully', async () => {
      // Arrange
      const classInstanceId = 'classInstanceId';
      const lecturer = buildLecturerMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.OnGoinging,
      });
      const ongoingClassInstance = buildOnGoingClassMock({
        currently_taking_attendance: false,
      });
      const studentEnrollments = [buildStudentCourseEnrollmentMock()];
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);
      jest
        .spyOn(onGoingClassRepo, 'findOneBy')
        .mockResolvedValue(ongoingClassInstance);
      jest
        .spyOn(coursesService, 'fetchStudentEnrollments')
        .mockResolvedValue(studentEnrollments);

      // Act
      const result = await service.takeAttendance(
        socket,
        classInstanceId,
        lecturer,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.currently_taking_attendance).toEqual(true);
      expect(service.findOneClassInstanceById).toHaveBeenCalledWith(
        classInstanceId,
      );
      expect(onGoingClassRepo.findOneBy).toHaveBeenCalled();
    });

    it('should throw error if class status is not OnGoinging', async () => {
      // Arrange
      const classInstanceId = 'classInstanceId';
      const lecturer = buildLecturerMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.Pending,
      });
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);

      // Act & Assert
      await expect(
        service.takeAttendance(socket, classInstanceId, lecturer),
      ).rejects.toThrow(WsException);
    });

    it('should throw UnauthorizedException if lecturer is not the owner of class', async () => {
      // Arrange
      const classInstanceId = 'classInstanceId';
      const lecturer = buildLecturerMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.OnGoinging,
        base: buildCourseClassMock({
          course: buildCourseMock({
            lecturer: buildLecturerMock({ id: 'another-id' }),
          }),
        }),
      });
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);

      // Act & Assert
      await expect(
        service.takeAttendance(socket, classInstanceId, lecturer),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('stopTakingAttendance', () => {
    it('should stop taking attendance successfully', async () => {
      // Arrange
      const classInstanceId = 'classInstanceId';
      const lecturer = buildLecturerMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.OnGoinging,
      });
      const ongoingClassInstance = buildOnGoingClassMock({
        currently_taking_attendance: true,
      });
      const studentEnrollments = [buildStudentCourseEnrollmentMock()];
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);
      jest
        .spyOn(onGoingClassRepo, 'findOneBy')
        .mockResolvedValue(ongoingClassInstance);
      jest
        .spyOn(coursesService, 'fetchStudentEnrollments')
        .mockResolvedValue(studentEnrollments);

      // Act
      const result = await service.stopTakingAttendance(
        socket,
        classInstanceId,
        lecturer,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.currently_taking_attendance).toEqual(false);
      expect(service.findOneClassInstanceById).toHaveBeenCalledWith(
        classInstanceId,
      );
      expect(onGoingClassRepo.findOneBy).toHaveBeenCalled();
    });

    it('should throw error if class status is not OnGoinging', async () => {
      // Arrange
      const classInstanceId = 'classInstanceId';
      const lecturer = buildLecturerMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.Pending,
      });
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);

      // Act & Assert
      await expect(
        service.stopTakingAttendance(socket, classInstanceId, lecturer),
      ).rejects.toThrow(WsException);
    });

    it('should throw UnauthorizedException if lecturer is not the owner of class', async () => {
      // Arrange
      const classInstanceId = 'classInstanceId';
      const lecturer = buildLecturerMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.OnGoinging,
        base: buildCourseClassMock({
          course: buildCourseMock({
            lecturer: buildLecturerMock({ id: 'another-id' }),
          }),
        }),
      });
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);

      // Act & Assert
      await expect(
        service.takeAttendance(socket, classInstanceId, lecturer),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('fetchOnGoingClass', () => {
    it('should return the ongoing class instance if the class exists and is ongoing', async () => {
      // Arrange
      const classInstance = buildClassInstanceMock({
        id: 'classInstanceId',
        status: ClassStatus.OnGoinging,
      });
      const onGoingClass = buildOnGoingClassMock();
      const studentEnrollments = [buildStudentCourseEnrollmentMock()];

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);
      jest
        .spyOn(service as any, 'findOrCreateOnGoingClass')
        .mockResolvedValueOnce(onGoingClass);
        jest
          .spyOn(coursesService, 'fetchStudentEnrollments')
          .mockResolvedValue(studentEnrollments);

      // Act
      const result = await service.fetchOnGoingClass('classInstanceId');

      // Assert
      expect(result).toEqual(onGoingClass);
      expect(service.findOneClassInstanceById).toHaveBeenCalledWith(
        'classInstanceId',
      );
      expect((service as any).findOrCreateOnGoingClass).toHaveBeenCalledWith(
        classInstance,
        studentEnrollments,
      );
    });

    it('should throw WsException if the class status is not ongoing', async () => {
      // Arrange
      const classInstance = buildClassInstanceMock({
        id: 'classInstanceId',
        status: ClassStatus.Pending,
      });

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);

      // Act & Assert
      await expect(
        service.fetchOnGoingClass('classInstanceId'),
      ).rejects.toThrow(WsException);
    });
  });

  describe('markAttendance', () => {
    it('should mark attendance for a student in an ongoing class', async () => {
      // Arrange
      const classInstanceId = 'class-instance-id';
      const student = buildStudentMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.OnGoinging
      });
      classInstance.status = ClassStatus.OnGoinging;
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const onGoingClass = buildOnGoingClassMock({
        currently_taking_attendance: true,
        present_enrolled_students: [],
      });
      const attendanceRecord = buildAttendanceMock();
      const attendanceRecords = [attendanceRecord];
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;

      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);
      jest
        .spyOn(coursesService, 'findOneStudentEnrollment')
        .mockResolvedValueOnce(studentEnrollment);
      jest
        .spyOn(coursesService, 'fetchStudentEnrollments')
        .mockResolvedValueOnce([studentEnrollment]);
      jest
        .spyOn((service as any), 'findOrCreateOnGoingClass')
        .mockResolvedValueOnce(onGoingClass as any);
      jest
        .spyOn(attendanceService, 'markStudentPresent')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(attendanceService, 'fetchAttendaceRecords')
        .mockResolvedValueOnce(attendanceRecords);

      // Act
      const result = await service.markAttendance(
        socket,
        student,
        classInstanceId,
      );

      // Assert
      expect(result).toEqual(onGoingClass);
      expect(service.findOneClassInstanceById).toHaveBeenCalledWith(
        classInstanceId,
      );
      expect(
        coursesService.findOneStudentEnrollment,
      ).toHaveBeenCalledWith({
        course: { id: classInstance.base.course.id },
        student: { id: student.id },
    });
      expect(
        coursesService.fetchStudentEnrollments,
      ).toHaveBeenCalledWith({ courseId: classInstance.base.course.id });
      expect(attendanceService.markStudentPresent).toHaveBeenCalledWith(
        studentEnrollment,
        classInstance,
      );
      expect(
        attendanceService.fetchAttendaceRecords,
      ).toHaveBeenCalledWith(classInstance);
    });

    it('should throw WsException if class is not ongoing', async () => {
      // Arrange
      const classInstanceId = 'class-instance-id';
      const student = buildStudentMock();
      const classInstance = buildClassInstanceMock({
        id: classInstanceId,
        status: ClassStatus.Pending
      });
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
      } as any;
    
      jest
        .spyOn(service, 'findOneClassInstanceById')
        .mockResolvedValueOnce(classInstance);

      // Act & Assert
      await expect(
        service.markAttendance(socket, student, classInstanceId),
      ).rejects.toThrow(WsException);
    });
  });
});
