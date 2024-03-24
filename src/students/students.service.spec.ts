import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { InstitutionsService } from '../institutions/institutions.service';
import { buildInstitutionMock } from '../test/institution.factory';
import {
  buildCreateStudentDtoMock,
  buildStudentMock,
} from '../test/student.factory';
import { CoursesService } from '../courses/courses.service';
import { buildCourseMock } from '../test/course.factory';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepository: Repository<Student>;
  let coursesService: CoursesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useClass: Repository,
        },
        {
          provide: InstitutionsService,
          useValue: {
            findOneById: jest.fn(),
          },
        },
        {
          provide: CoursesService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    coursesService = module.get<CoursesService>(CoursesService);
    studentRepository = module.get<Repository<Student>>(
      getRepositoryToken(Student),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a student', async () => {
      const createStudentDto = buildCreateStudentDtoMock();
      const expectedStudent: Student = buildStudentMock({
        ...createStudentDto,
        institution: buildInstitutionMock({
          id: createStudentDto.institution,
        }),
      });
      jest
        .spyOn(studentRepository, 'create')
        .mockReturnValueOnce(expectedStudent);
      const saveSpy = jest
        .spyOn(studentRepository, 'save')
        .mockResolvedValueOnce(expectedStudent);

      const result = await service.create(createStudentDto);

      expect(result).toEqual(expectedStudent);
      expect(saveSpy).toHaveBeenCalledWith(expectedStudent);
    });
  });

  describe('findAll', () => {
    it('should return all students', async () => {
      const mockStudents = [buildStudentMock(), buildStudentMock()];
      jest
        .spyOn(studentRepository, 'findBy')
        .mockResolvedValueOnce(mockStudents);

      const result = await service.findAll();

      expect(result).toBe(mockStudents);
      expect(studentRepository.findBy).toHaveBeenCalled();
    });

    it('should return all courses with custom whereClause for a user', async () => {
      const user = buildStudentMock({ institution: { id: 'institution-id' } });

      const whereClause: FindOptionsWhere<Student> = {
        gender: 'male',
      };
      const mockStudents = [
        buildStudentMock({ gender: 'male' }),
        buildStudentMock({ gender: 'male' }),
      ];
      jest
        .spyOn(studentRepository, 'findBy')
        .mockResolvedValueOnce(mockStudents);

      const result = await service.findAll(whereClause);

      expect(result).toBe(mockStudents);
      expect(studentRepository.findBy).toHaveBeenCalledWith({
        ...whereClause,
      });
    });
  });

  describe('fetchMyCourses', () => {
    it('should fetch courses for a student', async () => {
      const student = { id: 'student-id' } as Student;
      const mockCourses = [buildCourseMock(), buildCourseMock()];
      jest.spyOn(coursesService, 'findAll').mockResolvedValueOnce(mockCourses);

      const result = await service.fetchMyCourses(student);

      expect(result).toBe(mockCourses);
      expect(coursesService.findAll).toHaveBeenCalledWith(student, {
        studentsEnrollments: { studentId: student.id },
      });
    });
  });
});
