import '../test/mocks/firebase.mock';
import {
  buildOnGoingClassMock,
  buildClassWsEventDtoMock,
} from '../test/course-class.factory';
import { ClassesGateway } from './classes.gateway';
import { ClassesService } from './classes.service';
import { TestBed } from '@automock/jest';
import { Socket } from 'socket.io';
import { buildStudentMock } from '../test/student.factory';
import { buildLecturerMock } from '../test/lecturer.factory';
import WsEvents from '../constants/websocket-events';

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
      const classWsEventDto = buildClassWsEventDtoMock();
      const expectedResponse = buildOnGoingClassMock();
      jest
        .spyOn(classesService, 'startClass')
        .mockResolvedValue(expectedResponse);

      const socket: Socket = {
        join: jest.fn(),
      } as any;

      // Act
      const result = await gateway.handleStartClass(socket, classWsEventDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(classesService.startClass).toHaveBeenCalledWith(
        classWsEventDto.class_instance_id,
        socket,
      );
    });
  });

  describe('handleEndClass', () => {
    it('should end class with provided class instance id', async () => {
      // Arrange
      const classWsEventDto = buildClassWsEventDtoMock();
      const lecturer = buildLecturerMock();
      const socket: Socket = {
        join: jest.fn(),
        request: {
          user: lecturer,
        },
      } as any;

      jest.spyOn(classesService, 'endClass').mockResolvedValue();

      // Act
      const result = await gateway.handleEndClass(socket, classWsEventDto);

      // Assert
      expect(result).toEqual({
        event: WsEvents.EndClassAck,
        data: {
          message: 'Successful',
        },
      });
      expect(classesService.endClass).toHaveBeenCalledWith(
        socket,
        classWsEventDto.class_instance_id,
        lecturer,
      );
    });
  });

  describe('handleJoinClass', () => {
    it('should join class successfully', async () => {
      // Arrange
      const classWsEventDto = buildClassWsEventDtoMock({
        class_instance_id: 'classInstanceId',
      });
      const student = buildStudentMock();
      const expectedResponse = buildOnGoingClassMock();
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
        .mockResolvedValueOnce(expectedResponse);

      // Act
      const result = await gateway.handleJoinClass(socket, classWsEventDto);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(classesService.joinClass).toHaveBeenCalledWith(
        socket,
        student,
        classWsEventDto.class_instance_id,
      );
    });

    it('should throw error if class status is not OnGoinging', async () => {
      // Arrange
      const classWsEventDto = buildClassWsEventDtoMock({
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
        gateway.handleJoinClass(socket, classWsEventDto),
      ).rejects.toThrow('Class is not ongoing');
    });
  });

  describe('handleTakeAttendance', () => {
    it('should call takeAttendance method of classesService and return the result', async () => {
      // Arrange
      const classWsEventDto = buildClassWsEventDtoMock({
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
      const result = await gateway.handleTakeAttendance(
        socket,
        classWsEventDto,
      );

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
      const classWsEventDto = buildClassWsEventDtoMock({
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
      const result = await gateway.handleHaltAttendance(
        socket,
        classWsEventDto,
      );

      // Assert
      expect(result).toEqual(onGoingClass);
      expect(classesService.stopTakingAttendance).toHaveBeenCalledWith(
        socket,
        'classInstanceId',
        lecturer,
      );
    });
  });

  describe('handleFetchOngoingClass', () => {
    it('should call fetchOnGoingClass in service and return its result', async () => {
      // Arrange
      const classWsEventDto = buildClassWsEventDtoMock({
        class_instance_id: 'classInstanceId',
      });
      const lecturer = buildLecturerMock();
      const expectedResult = buildOnGoingClassMock();
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
        .spyOn(classesService, 'fetchOnGoingClass')
        .mockResolvedValueOnce(expectedResult);

      // Act
      const result = await gateway.handleFetchOngoingClass(
        socket,
        classWsEventDto,
      );

      // Assert
      expect(result).toEqual(expectedResult);
      expect(classesService.fetchOnGoingClass).toHaveBeenCalledWith(
        classWsEventDto.class_instance_id,
        lecturer
      );
    });
  });

  describe('handleMarkAttendance', () => {
    it('should call classesService.markAttendance with correct parameters', async () => {
      // Arrange
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
      const class_instance_id = 'class-instance-id';
      const classWsEventDto = { class_instance_id };
      jest.spyOn(classesService, 'markAttendance').mockResolvedValueOnce(null);

      // Act
      await gateway.handleMarkAttendance(socket, classWsEventDto);

      // Assert
      expect(classesService.markAttendance).toHaveBeenCalledWith(
        socket,
        student,
        class_instance_id,
      );
    });
  });
});
