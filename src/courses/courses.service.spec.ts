import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LecturersService } from '../lecturers/lecturers.service';
import {
  buildCourseMock,
  buildCreateCourseDtoMock,
  buildUpdateCourseDtoMock,
} from '../test/course.factory';
import { buildLecturerMock } from '../test/lecturer.factory';
import { NotFoundException } from '@nestjs/common';
import { buildStudentMock } from '../test/student.factory';
import { StudentCourseEnrollment } from './entities/student-course-enrollment.entity';
import { StudentsService } from '../students/students.service';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepository: Repository<Course>;
  let lecturerService: LecturersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        {
          provide: getRepositoryToken(Course),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(StudentCourseEnrollment),
          useClass: Repository,
        },
        {
          provide: LecturersService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: StudentsService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    courseRepository = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
    lecturerService = module.get<LecturersService>(LecturersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a course', async () => {
      const createCourseDto = buildCreateCourseDtoMock();
      const lecturer = buildLecturerMock();
      const mockCourse = buildCourseMock(createCourseDto);

      jest.spyOn(courseRepository, 'create').mockReturnValueOnce(mockCourse);
      jest.spyOn(courseRepository, 'save').mockResolvedValueOnce(mockCourse);
      jest
        .spyOn(lecturerService, 'findOneById')
        .mockResolvedValueOnce(lecturer);

      const result = await service.create(createCourseDto, lecturer);

      expect(result).toBe(mockCourse);
      expect(courseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining(createCourseDto),
      );
      expect(courseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(createCourseDto),
      );
    });
  });

  describe('findAll', () => {
    it('should return all courses for a user', async () => {
      const user = { institution: { id: 'institution-id' } } as any;
      const mockCourses = [buildCourseMock(), buildCourseMock()];
      jest.spyOn(courseRepository, 'findBy').mockResolvedValueOnce(mockCourses);

      const result = await service.findAll(user);

      expect(result).toBe(mockCourses);
      expect(courseRepository.findBy).toHaveBeenCalledWith({
        institution: { id: user.institution.id },
      });
    });

     it('should return all courses with custom whereClause for a user', async () => {
       const user = buildStudentMock({institution: {id: 'institution-id' }});
       
       const whereClause: FindOptionsWhere<Course> = {
         unit: 6,
       };
       const mockCourses = [buildCourseMock({unit: 6}), buildCourseMock({unit: 6})];
       jest
         .spyOn(courseRepository, 'findBy')
         .mockResolvedValueOnce(mockCourses);

       const result = await service.findAll(user, whereClause);

       expect(result).toBe(mockCourses);
       expect(courseRepository.findBy).toHaveBeenCalledWith({
         ...whereClause,
         institution: { id: user.institution.id },
       });
     });
  });

  describe('findOneById', () => {
    it('should return a course by id', async () => {
      const courseId = 'course-id';
      const mockCourse = buildCourseMock({ id: courseId });
      jest
        .spyOn(courseRepository, 'findOneBy')
        .mockResolvedValueOnce(mockCourse);

      const result = await service.findOneById(courseId);

      expect(result).toBe(mockCourse);
      expect(courseRepository.findOneBy).toHaveBeenCalledWith({ id: courseId });
    });

    it('should throw NotFoundException if course not found', async () => {
      const courseId = 'course-id';
      jest
        .spyOn(courseRepository, 'findOneBy')
        .mockResolvedValueOnce(undefined);

      await expect(service.findOneById(courseId)).rejects.toThrow(
        NotFoundException,
      );
      expect(courseRepository.findOneBy).toHaveBeenCalledWith({ id: courseId });
    });
  });

  describe('findOneByCourseCode', () => {
    it('should return a course by course code', async () => {
      const courseCode = 'CS101';
      const mockCourse = buildCourseMock({ course_code: courseCode });
      jest
        .spyOn(courseRepository, 'findOneBy')
        .mockResolvedValueOnce(mockCourse);

      const result = await service.findOneByCourseCode(courseCode);

      expect(result).toBe(mockCourse);
      expect(courseRepository.findOneBy).toHaveBeenCalledWith({
        course_code: courseCode,
      });
    });

    it('should throw NotFoundException if course not found', async () => {
      const courseCode = 'CS101';
      jest
        .spyOn(courseRepository, 'findOneBy')
        .mockResolvedValueOnce(undefined);

      await expect(service.findOneByCourseCode(courseCode)).rejects.toThrow(
        NotFoundException,
      );
      expect(courseRepository.findOneBy).toHaveBeenCalledWith({
        course_code: courseCode,
      });
    });
  });

  describe('search', () => {
    it('should return courses matching search text for a user', async () => {
      const searchText = 'search-Text';
      const user = { institution: { id: 'institution-id' } } as any;
      const mockCourses = [new Course(), new Course()];
      jest.spyOn(courseRepository, 'findBy').mockResolvedValueOnce(mockCourses);

      const result = await service.search(searchText, user);

      const searchTextLower = searchText.toLowerCase();

      expect(result).toBe(mockCourses);
      // Validating it was called with ILike helps validate that the function is case-insensitive
      expect(courseRepository.findBy).toHaveBeenCalledWith([
        {
          course_code: ILike(`%${searchTextLower}%`),
          institution: { id: user.institution.id },
        },
        {
          title: ILike(`%${searchTextLower}%`),
          institution: { id: user.institution.id },
        },
      ]);
    });
  });

  describe('update', () => {
    it('should update a course', async () => {
      const courseId = 'course-id';
      const updateCourseDto = buildUpdateCourseDtoMock({ unit: 9 });
      const mockCourse = buildCourseMock({ id: courseId });
      const updatedCourseMock = buildCourseMock({
        ...mockCourse,
        ...updateCourseDto,
      });
      jest
        .spyOn(service, 'findOneById')
        .mockResolvedValueOnce(mockCourse)
        .mockResolvedValueOnce(updatedCourseMock);
      jest
        .spyOn(courseRepository, 'save')
        .mockResolvedValueOnce(updatedCourseMock);

      const result = await service.update(courseId, updateCourseDto);

      expect(result).toBe(updatedCourseMock);
      expect(courseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateCourseDto),
      );
    });
  });

  describe('remove', () => {
    it('should remove a course', async () => {
      const courseId = 'course-id';
      const mockCourse = buildCourseMock({ id: courseId });
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(mockCourse);
      jest.spyOn(courseRepository, 'delete').mockResolvedValueOnce(undefined);

      await service.remove(courseId);

      expect(courseRepository.delete).toHaveBeenCalledWith(courseId);
    });

    it('should throw NotFoundException if course not found', async () => {
      const courseId = 'course-id';
      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(undefined);

      await expect(service.remove(courseId)).rejects.toThrow(NotFoundException);
    });
  });
});
