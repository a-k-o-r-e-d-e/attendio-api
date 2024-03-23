import { Test, TestingModule } from '@nestjs/testing';
import { LecturersController } from './lecturers.controller';
import { LecturersService } from './lecturers.service';
import {
  buildLecturerMock,
  buildUpdateLecturerDtoMock,
} from '../test/lecturer.factory';

describe('LecturersController', () => {
  let controller: LecturersController;
  let service: LecturersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LecturersController],
      providers: [
        {
          provide: LecturersService,
          useValue: {
            findOneById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LecturersController>(LecturersController);
    service = module.get<LecturersService>(LecturersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return lecturer by ID', async () => {
      const mockLecturer = buildLecturerMock();
      const req = { user: mockLecturer };

      const result = await controller.getMyProfile(req);

      expect(result).toEqual(mockLecturer);
    });
  });

  describe('findOneById', () => {
    it('should return a lecturer by id', async () => {
      const lecturerId = 'lecturer-id';
      const mockLecturer = buildLecturerMock({ id: lecturerId });

      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(mockLecturer);

      const result = await controller.findOneById(lecturerId);

      expect(result).toBe(mockLecturer);
      expect(service.findOneById).toHaveBeenCalledWith(lecturerId);
    });
  });

  describe('editLecturerProfile', () => {
    it('should update lecturer profile', async () => {
      const mockLecturer = buildLecturerMock();
      const mockUpdateDto = buildUpdateLecturerDtoMock({ title: 'Mrs' });
      const mockUpdatedLecturer = buildLecturerMock(mockUpdateDto);
      const req = { user: mockLecturer };

      jest.spyOn(service, 'update').mockResolvedValueOnce(mockUpdatedLecturer);

      const result = await controller.editLecturerProfile(mockUpdateDto, req);

      expect(result).toEqual(mockUpdatedLecturer);
      expect(service.update).toHaveBeenCalledWith(mockLecturer, mockUpdateDto);
    });
  });
});
