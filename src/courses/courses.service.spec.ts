import { Test, TestingModule } from '@nestjs/testing';
import { CoursesService } from './courses.service';
import { Course } from './entities/course.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LecturersService } from '../lecturers/lecturers.service';
import {
  buildCourseMock,
  buildCreateCourseDtoMock,
  buildStudentCourseEnrollmentMock,
  buildUpdateCourseDtoMock,
} from '../test/course.factory';
import { buildLecturerMock } from '../test/lecturer.factory';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { buildStudentMock } from '../test/student.factory';
import { StudentCourseEnrollment } from './entities/student-course-enrollment.entity';
import { StudentsService } from '../students/students.service';
import { PostgresErrorCode } from '../database/postgres-errorcodes.enum';
import { ClassesService } from '../classes/classes.service';
import { buildCourseClassMock } from '../test/course-class.factory';

describe('CoursesService', () => {
  let service: CoursesService;
  let courseRepository: Repository<Course>;
  let lecturerService: LecturersService;
  let studentEnrollmentRepo: Repository<StudentCourseEnrollment>;
  let studentService: StudentsService;
  let classesService: ClassesService;

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
        {
          provide: ClassesService,
          useValue: {
            findAllCourseClasses: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
    lecturerService = module.get<LecturersService>(LecturersService);
    studentService = module.get<StudentsService>(StudentsService);
    courseRepository = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
    studentEnrollmentRepo = module.get<Repository<StudentCourseEnrollment>>(
      getRepositoryToken(StudentCourseEnrollment),
    );
    classesService = module.get<ClassesService>(ClassesService);
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
      const user = buildStudentMock({ institution: { id: 'institution-id' } });

      const whereClause: FindOptionsWhere<Course> = {
        unit: 6,
      };
      const mockCourses = [
        buildCourseMock({ unit: 6 }),
        buildCourseMock({ unit: 6 }),
      ];
      jest.spyOn(courseRepository, 'findBy').mockResolvedValueOnce(mockCourses);

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

  describe('enrollStudent', () => {
    it('should enroll a student for a course', async () => {
      const courseId = 'course-id';
      const studentId = 'student-id';
      const course = buildCourseMock({ id: courseId });
      const student = buildStudentMock({ id: studentId });

      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(course);
      jest
        .spyOn(studentEnrollmentRepo, 'save')
        .mockResolvedValueOnce(undefined);

      await service.enrollStudent(courseId, student);

      expect(service.findOneById).toHaveBeenCalledWith(courseId);
      expect(studentEnrollmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          course_id: courseId,
          student_id: studentId,
          student,
          course,
        }),
      );
    });

    it('should throw BadRequestException if student is already enrolled', async () => {
      const courseId = 'course-id';
      const studentId = 'student-id';
      const course = buildCourseMock({ id: courseId });
      const student = buildStudentMock({ id: studentId });

      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(course);
      jest.spyOn(studentEnrollmentRepo, 'save').mockRejectedValueOnce({
        code: PostgresErrorCode.UniqueViolation,
      });

      await expect(service.enrollStudent(courseId, student)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('fetchEnrolledStudents', () => {
    it('should fetch enrolled students for a course', async () => {
      const courseId = 'course-id';
      const course = buildCourseMock({ id: courseId });
      const enrolledStudents = [buildStudentMock(), buildStudentMock()];

      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(course);
      jest
        .spyOn(studentService, 'findAll')
        .mockResolvedValueOnce(enrolledStudents);

      const result = await service.fetchEnrolledStudents(courseId);

      expect(service.findOneById).toHaveBeenCalledWith(courseId);
      expect(studentService.findAll).toHaveBeenCalledWith({
        coursesEnrollments: { courseId: course.id },
      });
      expect(result).toBe(enrolledStudents);
    });
  });

  describe('unenrollStudent', () => {
    it('should unenroll a student from a course', async () => {
      const courseId = 'course-id';
      const studentId = 'student-id';
      const course = buildCourseMock({ id: courseId });
      const student = buildStudentMock({ id: studentId });
      const studentEnrollment = buildStudentCourseEnrollmentMock({
        id: 'enrollment-id',
        courseId,
        studentId,
        course,
        student,
      });

      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(course);
      jest
        .spyOn(studentEnrollmentRepo, 'findOneBy')
        .mockResolvedValueOnce(studentEnrollment);
      jest
        .spyOn(studentEnrollmentRepo, 'delete')
        .mockResolvedValueOnce(undefined);

      await expect(
        service.unenrollStudent(courseId, student),
      ).resolves.not.toThrow();
      expect(service.findOneById).toHaveBeenCalledWith(courseId);
      expect(studentEnrollmentRepo.findOneBy).toHaveBeenCalledWith({
        courseId,
        studentId,
      });
      expect(studentEnrollmentRepo.delete).toHaveBeenCalledWith(
        'enrollment-id',
      );
    });

    it('should throw NotFoundException if student is not enrolled in the course', async () => {
      const courseId = 'course-id';
      const studentId = 'student-id';
      const course = buildCourseMock({ id: courseId });
      const student = buildStudentMock({ id: studentId });

      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(course);
      jest
        .spyOn(studentEnrollmentRepo, 'findOneBy')
        .mockResolvedValueOnce(undefined);

      await expect(service.unenrollStudent(courseId, student)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fetchCourseClasses', () => {
    it('should return course classes for a given course ID', async () => {
      const courseId = '12345';
      const course: Course = buildCourseMock({ id: courseId });
      const expectedClasses = [
        buildCourseClassMock({
          course: course,
        }),
        buildCourseClassMock({
          course: course,
        }),
      ]; // Mocked array of course classes

      jest.spyOn(service, 'findOneById').mockResolvedValue(course);
      jest
        .spyOn(classesService, 'findAllCourseClasses')
        .mockResolvedValue(expectedClasses);

      const result = await service.fetchCourseClasses(courseId);

      expect(result).toEqual(expectedClasses);
      expect(service.findOneById).toHaveBeenCalledWith(courseId);
      expect(classesService.findAllCourseClasses).toHaveBeenCalledWith({
        course: { id: course.id },
      });
    });
  });
});
