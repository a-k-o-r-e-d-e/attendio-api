import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import {
  buildCourseMock,
  buildCreateCourseDtoMock,
  buildUpdateCourseDtoMock,
} from '../test/course.factory';
import { buildLecturerMock } from '../test/lecturer.factory';
import { buildStudentMock } from '../test/student.factory';
import { NotFoundException } from '@nestjs/common';

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [
        {
          provide: CoursesService,
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

    controller = module.get<CoursesController>(CoursesController);
    coursesService = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const createCourseDto = buildCreateCourseDtoMock();
      const req = { user: buildLecturerMock() } as any;
      const createdCourse = buildCourseMock(createCourseDto);

      jest.spyOn(coursesService, 'create').mockResolvedValueOnce(createdCourse);

      const result = await controller.create(req, createCourseDto);

      expect(result).toBe(createdCourse);
      expect(coursesService.create).toHaveBeenCalledWith(
        createCourseDto,
        req.user,
      );
    });

  });

   describe('findAll', () => {
     it('should return all courses for a user', async () => {
       const user = buildStudentMock();
       const mockCourses = [buildCourseMock(), buildCourseMock()];
       jest.spyOn(coursesService, 'findAll').mockResolvedValueOnce(mockCourses);

       const result = await controller.findAll({ user });

       expect(result).toBe(mockCourses);
       expect(coursesService.findAll).toHaveBeenCalledWith(user);
     });
   });

   describe('findOneById', () => {
     it('should return a course by id', async () => {
       const courseId = 'course-id';
       const mockCourse = buildCourseMock({id: courseId});

       jest
         .spyOn(coursesService, 'findOneById')
         .mockResolvedValueOnce(mockCourse);

       const result = await controller.findOneById(courseId);

       expect(result).toBe(mockCourse);
       expect(coursesService.findOneById).toHaveBeenCalledWith(courseId);
     });
   });

   describe('search', () => {
     it('should search for courses', async () => {
       const searchText = 'search-text';
       const user = buildStudentMock();
       const mockCourses = [buildCourseMock(), buildCourseMock()];
       jest.spyOn(coursesService, 'search').mockResolvedValueOnce(mockCourses);

       const result = await controller.search(searchText, { user });

       expect(result).toBe(mockCourses);
       expect(coursesService.search).toHaveBeenCalledWith(searchText, user);
     });
   });

   describe('update', () => {
     it('should update a course', async () => {
       const courseId = 'course-id';
       const updateCourseDto = buildUpdateCourseDtoMock({unit: 9})
       const mockCourse = buildCourseMock();
       const updatedCourse = buildCourseMock({...mockCourse, ...updateCourseDto});
       jest.spyOn(coursesService, 'update').mockResolvedValueOnce(updatedCourse);

       const result = await controller.update(courseId, updateCourseDto);

       expect(result).toBe(updatedCourse);
       expect(coursesService.update).toHaveBeenCalledWith(courseId, updateCourseDto);
     });
   });

   describe('remove', () => {
     it('should remove a course', async () => {
       const courseId = 'course-id';
       jest.spyOn(coursesService, 'remove').mockResolvedValueOnce(undefined);

       const result = await controller.remove(courseId);

       expect(result).toEqual({ message: 'Successful' });
       expect(coursesService.remove).toHaveBeenCalledWith(courseId);
     });
   });
});
