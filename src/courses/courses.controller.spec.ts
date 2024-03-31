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
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
            enrollStudent: jest.fn(),
            fetchEnrolledStudents: jest.fn(),
            unenrollStudent: jest.fn(),
            fetchCourseClasses: jest.fn(),
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
      const mockCourse = buildCourseMock({ id: courseId });

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
      const updateCourseDto = buildUpdateCourseDtoMock({ unit: 9 });
      const mockCourse = buildCourseMock();
      const updatedCourse = buildCourseMock({
        ...mockCourse,
        ...updateCourseDto,
      });
      jest.spyOn(coursesService, 'update').mockResolvedValueOnce(updatedCourse);

      const result = await controller.update(courseId, updateCourseDto);

      expect(result).toBe(updatedCourse);
      expect(coursesService.update).toHaveBeenCalledWith(
        courseId,
        updateCourseDto,
      );
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

  describe('enrollStudent', () => {
    it('should enroll a student for a course', async () => {
      const courseId = 'course-id';
      const student = buildStudentMock();
      const req = {
        user: student,
      } as any;
      jest
        .spyOn(coursesService, 'enrollStudent')
        .mockResolvedValueOnce(undefined);

      const result = await controller.enrollStudent(courseId, req);

      expect(result).toEqual({ message: 'Successful' });
      expect(coursesService.enrollStudent).toHaveBeenCalledWith(
        courseId,
        student,
      );
    });

    it('should throw BadRequestException if enrollment fails', async () => {
      const courseId = 'course-id';
      const student = buildStudentMock();
      const req = {
        user: student,
      } as any;

      jest
        .spyOn(coursesService, 'enrollStudent')
        .mockRejectedValueOnce(new BadRequestException());

      await expect(controller.enrollStudent(courseId, req)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('fetchEnrolledStudents', () => {
    it('should fetch enrolled students for a course', async () => {
      const courseId = 'course-id';
      const lecturer = buildLecturerMock();
      const enrolledStudents = [buildStudentMock(), buildStudentMock()];

      jest
        .spyOn(coursesService, 'fetchEnrolledStudents')
        .mockResolvedValueOnce(enrolledStudents);

      const result = await controller.fetchEnrolledStudents(courseId);

      expect(result).toEqual(enrolledStudents);
      expect(coursesService.fetchEnrolledStudents).toHaveBeenCalledWith(
        courseId,
      );
    });

    it('should throw NotFoundException if course not found', async () => {
      const courseId = 'course-id';

      jest
        .spyOn(coursesService, 'fetchEnrolledStudents')
        .mockRejectedValueOnce(new NotFoundException());

      await expect(controller.fetchEnrolledStudents(courseId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unenrollStudent', () => {
    it('should unenroll a student from a course', async () => {
      const courseId = 'course-id';
      const studentId = 'student-id';
      const student = buildStudentMock({ id: studentId });
      const requestMock = {
        user: student,
      } as any;

      jest
        .spyOn(coursesService, 'unenrollStudent')
        .mockResolvedValueOnce(undefined);

      const result = await controller.unenrollStudent(courseId, requestMock);

      expect(result).toEqual({ message: 'Successful' });
      expect(coursesService.unenrollStudent).toHaveBeenCalledWith(
        courseId,
        student,
      );
    });
  });

  describe('fetchCourseClasses', () => {
    it('should return course classes', async () => {
      const courseId = '12345';
      const expectedResponse = []; // Mocked array of course classes

      jest
        .spyOn(coursesService, 'fetchCourseClasses')
        .mockResolvedValue(expectedResponse);

      const result = await controller.fetchCourseClasses(courseId);

      expect(result).toEqual(expectedResponse);
      expect(coursesService.fetchCourseClasses).toHaveBeenCalledWith(courseId);
    });
  });
});
