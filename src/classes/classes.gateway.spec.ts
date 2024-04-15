import '../test/mocks/firebase.mock';
import {
  buildOnGoingClassMock,
  buildStartClassDtoMock,
} from '../test/course-class.factory';
import { ClassesGateway } from './classes.gateway';
import { ClassesService } from './classes.service';
import { TestBed } from '@automock/jest';
import { Socket } from 'socket.io';
import { buildStudentMock } from '../test/student.factory';
import { buildLecturerMock, buildLecturerMock as lecturer } from '../test/lecturer.factory';

describe('ClassesGateway', () => {
  let gateway: ClassesGateway;
  let classesService: ClassesService;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(ClassesGateway).compile();

    gateway = unit;
    classesService = unitRef.get(ClassesService);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleStartClass', () => {
    it('should start class with provided class instance id', async () => {
      // Arrange
      const startClassDto = buildStartClassDtoMock();
      const expectedResponse = buildOnGoingClassMock();
      jest
        .spyOn(classesService, 'startClass')
        .mockResolvedValue(expectedResponse);

      const socket: Socket = {
        join: jest.fn(),
      } as any;

      // Act
      const result = await gateway.handleStartClass(socket, startClassDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(classesService.startClass).toHaveBeenCalledWith(
        startClassDto.class_instance_id,
        socket
      );
    });
  });

  describe('handleJoinClass', () => {
    it('should join class successfully', async () => {
      // Arrange
      const startClassDto = buildStartClassDtoMock({class_instance_id: 'classInstanceId'});
      const student = buildStudentMock();
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
        request: {
          user: student
        }
      } as any;

      jest.spyOn(classesService, 'joinClass').mockResolvedValueOnce();

      // Act
      const result = await gateway.handleJoinClass(socket, startClassDto);

      // Assert
      expect(result).toEqual({ message: 'Successful' });
      expect(classesService.joinClass).toHaveBeenCalledWith(
        socket,
        student,
        startClassDto.class_instance_id,
      );
    });

    it('should throw error if class status is not OnGoinging', async () => {
      // Arrange
      const startClassDto = buildStartClassDtoMock({
        class_instance_id: 'classInstanceId',
      });
      const student = buildStudentMock();
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
        request: {
          user: student,
        },
      } as any;

      jest
        .spyOn(classesService, 'joinClass')
        .mockRejectedValueOnce(new Error('Class is not ongoing'));

      // Act & Assert
      await expect(
        gateway.handleJoinClass(socket, startClassDto),
      ).rejects.toThrow('Class is not ongoing');
    });
  });

  describe('handleTakeAttendance', () => {
    it('should call takeAttendance method of classesService and return the result', async () => {
      // Arrange
      const startClassDto = buildStartClassDtoMock({
        class_instance_id: 'classInstanceId',
      });
      const lecturer = buildLecturerMock();
      const onGoingClass = buildOnGoingClassMock();
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
        request: {
          user: lecturer,
        },
      } as any;

      
      jest
        .spyOn(classesService, 'takeAttendance')
        .mockResolvedValueOnce(onGoingClass);

      // Act
      const result = await gateway.handleTakeAttendance(socket, startClassDto);

      // Assert
      expect(result).toEqual(onGoingClass);
      expect(classesService.takeAttendance).toHaveBeenCalledWith(
        socket,
        'classInstanceId',
        lecturer,
      );
    });
  });

  describe('handleHaltAttendance', () => {
    it('should call stopTakingAttendance method of classesService and return the result', async () => {
      // Arrange
      const startClassDto = buildStartClassDtoMock({
        class_instance_id: 'classInstanceId',
      });
      const lecturer = buildLecturerMock();
      const onGoingClass = buildOnGoingClassMock();
      const socket: Socket = {
        join: jest.fn(),
        to: jest.fn().mockReturnValue({
          emit: jest.fn().mockReturnValue(true),
        }),
        request: {
          user: lecturer,
        },
      } as any;

      jest
        .spyOn(classesService, 'stopTakingAttendance')
        .mockResolvedValueOnce(onGoingClass);

      // Act
      const result = await gateway.handleHaltAttendance(socket, startClassDto);

      // Assert
      expect(result).toEqual(onGoingClass);
      expect(classesService.stopTakingAttendance).toHaveBeenCalledWith(
        socket,
        'classInstanceId',
        lecturer,
      );
    });
  });
});
