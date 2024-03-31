import { Test, TestingModule } from '@nestjs/testing';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import {
  buildClassInstanceMock,
  buildCreateCourseClassDtoMock,
} from '../test/course-class.factory';

describe('ClassesController', () => {
  let controller: ClassesController;
  let classesService: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassesController],
      providers: [
        {
          provide: ClassesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            search: jest.fn(),
            findOneById: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ClassesController>(ClassesController);
    classesService = module.get<ClassesService>(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new class', async () => {
      const createCourseClassDto = buildCreateCourseClassDtoMock();

      const expectedResult = buildClassInstanceMock(); // Define expected result here

      jest
        .spyOn(classesService, 'create')
        .mockResolvedValueOnce(expectedResult);

      // Call the controller method
      const result = await controller.create(createCourseClassDto);

      // Validate that ClassesService.create is called with the correct parameters
      expect(classesService.create).toHaveBeenCalledWith(createCourseClassDto);

      // Validate the result returned by the controller
      expect(result).toEqual(expectedResult);
    });
  });
});
