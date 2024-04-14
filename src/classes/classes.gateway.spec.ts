import '../test/mocks/firebase.mock';
import {
  buildOnGoingClassMock,
  buildStartClassDtoMock,
} from '../test/course-class.factory';
import { ClassesGateway } from './classes.gateway';
import { ClassesService } from './classes.service';
import { TestBed } from '@automock/jest';
import { Socket } from 'socket.io';

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
});
