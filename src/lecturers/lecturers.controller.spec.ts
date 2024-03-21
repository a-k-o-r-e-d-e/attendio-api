import { Test, TestingModule } from '@nestjs/testing';
import { LecturersController } from './lecturers.controller';
import { LecturersService } from './lecturers.service';
import { buildLecturerMock, buildUpdateLecturerDtoMock } from '../test/lecturer.factory';

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
            getById: jest.fn(),
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

   describe('getById', () => {
     it('should return lecturer by ID', async () => {
       const mockLecturer = buildLecturerMock()
       const req = { user: mockLecturer };

       const result = await controller.getById(req);

       expect(result).toEqual(mockLecturer);
     });
   });

   describe('editLecturerProfile', () => {
     it('should update lecturer profile', async () => {
       const mockLecturer = buildLecturerMock();
       const mockUpdateDto = buildUpdateLecturerDtoMock({title: "Mrs"});
       const mockUpdatedLecturer = buildLecturerMock(mockUpdateDto)
       const req = { user: mockLecturer };

       jest.spyOn(service, 'update').mockResolvedValueOnce(mockUpdatedLecturer);

       const result = await controller.editLecturerProfile(mockUpdateDto, req);

       expect(result).toEqual(mockUpdatedLecturer);
       expect(service.update).toHaveBeenCalledWith(mockLecturer, mockUpdateDto);
     });
   });
});
