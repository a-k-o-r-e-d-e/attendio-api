import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import {
  buildStudentMock,
  buildUpdateStudentDtoMock,
} from '../test/student.factory';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('should return lecturer by ID', async () => {
      const mockStudent = buildStudentMock();
      const req = { user: mockStudent };

      const result = await controller.findOneById(req);

      expect(result).toEqual(mockStudent);
    });
  });

  describe('editStudentProfile', () => {
    it('should update lecturer profile', async () => {
      const mockStudent = buildStudentMock();
      const mockUpdateDto = buildUpdateStudentDtoMock({ title: 'Mrs' });
      const mockUpdatedStudent = buildStudentMock(mockUpdateDto);
      const req = { user: mockStudent };

      jest.spyOn(service, 'update').mockResolvedValueOnce(mockUpdatedStudent);

      const result = await controller.editStudentProfile(mockUpdateDto, req);

      expect(result).toEqual(mockUpdatedStudent);
      expect(service.update).toHaveBeenCalledWith(mockStudent, mockUpdateDto);
    });
  });
});
