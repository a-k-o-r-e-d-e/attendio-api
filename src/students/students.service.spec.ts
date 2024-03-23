import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstitutionsService } from '../institutions/institutions.service';
import { buildInstitutionMock } from '../test/institution.factory';
import {
  buildCreateStudentDtoMock,
  buildStudentMock,
} from '../test/student.factory';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepository: Repository<Student>;

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
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
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
      jest.spyOn(studentRepository, 'create').mockReturnValueOnce(expectedStudent);
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
      jest.spyOn(studentRepository, 'find').mockResolvedValueOnce(mockStudents);

      const result = await service.findAll();

      expect(result).toBe(mockStudents);
      expect(studentRepository.find).toHaveBeenCalled();
    });
  });
});
