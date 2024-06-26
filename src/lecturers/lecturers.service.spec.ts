import '../test/mocks/firebase.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { LecturersService } from './lecturers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lecturer } from './lecturer.entity';
import {
  buildCreateLecturerDtoMock,
  buildLecturerMock,
  buildUpdateLecturerDtoMock,
} from '../test/lecturer.factory';
import { NotFoundException } from '@nestjs/common';
import { buildInstitutionMock } from '../test/institution.factory';
import { InstitutionsService } from '../institutions/institutions.service';
import { buildCourseMock } from '../test/course.factory';
import { CoursesService } from '../courses/courses.service';
import { ClassesService } from '../classes/classes.service';
import { buildClassInstanceMock } from '../test/course-class.factory';

describe('LecturersService', () => {
  let service: LecturersService;
  let repository: Repository<Lecturer>;
  let coursesService: CoursesService;
  let classesService: ClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturersService,
        {
          provide: getRepositoryToken(Lecturer),
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
        {
          provide: ClassesService,
          useValue: {
            findAllClassInstances: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LecturersService>(LecturersService);
    repository = module.get<Repository<Lecturer>>(getRepositoryToken(Lecturer));
    coursesService = module.get<CoursesService>(CoursesService);
    classesService = module.get<ClassesService>(ClassesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all lecturers', async () => {
      const expectedLecturers: Lecturer[] = [buildLecturerMock()];
      jest.spyOn(repository, 'find').mockResolvedValue(expectedLecturers);

      const result = await service.findAll();

      expect(result).toEqual(expectedLecturers);
    });
  });

  describe('findOneById', () => {
    it('should return a lecturer by ID if found', async () => {
      const lecturerId = '123';
      const expectedLecturer: Lecturer = buildLecturerMock({ id: lecturerId });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(expectedLecturer);

      const result = await service.findOneById(lecturerId);

      expect(result).toEqual(expectedLecturer);
    });

    it('should throw NotFoundException if lecturer with ID is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.findOneById('123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getByEmail', () => {
    it('should return a lecturer by email if found', async () => {
      const testEmail = 'test@example.com';
      const expectedLecturer: Lecturer = buildLecturerMock({
        user: { email: testEmail },
      });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(expectedLecturer);

      const result = await service.findOneByEmail(testEmail);

      expect(result).toEqual(expectedLecturer);
    });

    it('should throw NotFoundException if lecturer with email is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.findOneByEmail('test@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getByUsername', () => {
    it('should return a lecturer by username if found', async () => {
      const username = 'testuser';
      const expectedLecturer: Lecturer = buildLecturerMock({
        user: { username },
      });
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce(expectedLecturer);

      const result = await service.findOneByUsername(username);

      expect(result).toEqual(expectedLecturer);
    });

    it('should throw NotFoundException if lecturer with username is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(undefined);

      await expect(service.findOneByUsername('testuser')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new lecturer', async () => {
      const createLecturerDto = buildCreateLecturerDtoMock();
      const expectedLecturer: Lecturer = buildLecturerMock({
        ...createLecturerDto,
        institution: buildInstitutionMock({
          id: createLecturerDto.institution,
        }),
      });
      jest.spyOn(repository, 'create').mockReturnValueOnce(expectedLecturer);
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValueOnce(expectedLecturer);

      const result = await service.create(createLecturerDto);

      expect(result).toEqual(expectedLecturer);
      expect(saveSpy).toHaveBeenCalledWith(expectedLecturer);
    });
  });

  describe('update', () => {
    it('should update a lecturer', async () => {
      const lecturerId = 'test-id';
      const lecturer: Lecturer = buildLecturerMock({ id: lecturerId }); // Define lecturer
      const updateLecturerDto = buildUpdateLecturerDtoMock({ title: 'Mrs' });
      const updatedLecturer: Lecturer = buildLecturerMock({
        id: lecturerId,
        ...updateLecturerDto,
      });
      const saveSpy = jest
        .spyOn(repository, 'save')
        .mockResolvedValue(updatedLecturer);
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce(updatedLecturer);

      const result = await service.update(lecturer, updateLecturerDto);

      expect(result).toEqual(updatedLecturer);
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should only update specified fields', async () => {
      const updatedEmail = 'jane@example.com';
      const updatedNumber = '987654321';
      // Mocked lecturer object
      const existingLecturer: Lecturer = buildLecturerMock();

      // Define updateLecturerDto with fields to be updated
      const updateLecturerDto = buildUpdateLecturerDtoMock({
        phone_number: updatedNumber,
        user: {
          email: updatedEmail,
        },
      });

      // Expected updated lecturer object after applying updateLecturerDto
      const expectedUpdatedLecturer: Lecturer = buildLecturerMock({
        ...existingLecturer,
        phone_number: updatedNumber,
        user: {
          ...existingLecturer.user,
          email: updatedEmail,
        },
        updated_at: expect.any(Date), // updated_at should be automatically updated
      });

      // Mock repository's save method to return expectedUpdatedLecturer
      jest.spyOn(repository, 'save').mockResolvedValue(expectedUpdatedLecturer);
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce(expectedUpdatedLecturer);

      // Call update method of service
      const result = await service.update(existingLecturer, updateLecturerDto);

      // Assert that only specified fields are updated
      expect(result).toEqual(expectedUpdatedLecturer);
    });
  });

  describe('delete', () => {
    it('should delete a lecturer', async () => {
      const lecturerId = '123';
      const expectedDeletedLecturer: Lecturer = buildLecturerMock({
        id: lecturerId,
      });
      jest
        .spyOn(repository, 'findOneBy')
        .mockResolvedValueOnce(expectedDeletedLecturer);

      jest.spyOn(repository, 'delete').mockResolvedValue({} as any);

      await service.delete(lecturerId);

      expect(repository.delete).toHaveBeenCalledWith(lecturerId);
    });

    it('should throw NotFoundException if lecturer to delete is not found', async () => {
      const lecturerId = '123';
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(undefined);

      await expect(service.delete(lecturerId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('fetchMyCourses', () => {
    it('should fetch courses created by a lecturer', async () => {
      const lecturer = buildLecturerMock({ id: 'lecturer-id' });
      const mockCourses = [buildCourseMock(), buildCourseMock()];
      jest.spyOn(coursesService, 'findAll').mockResolvedValueOnce(mockCourses);

      const result = await service.fetchMyCourses(lecturer);

      expect(result).toBe(mockCourses);
      expect(coursesService.findAll).toHaveBeenCalledWith(lecturer, {
        lecturer: {
          id: lecturer.id,
        },
      });
    });
  });

  describe('fetchMyClassInstances', () => {
    it('should return class instances for a given lecturer', async () => {
      const lecturerId = '12345';
      const lecturer = buildLecturerMock({ id: lecturerId });
      const expectedClassInstances = [
        buildClassInstanceMock(),
        buildClassInstanceMock(),
      ];

      jest
        .spyOn(classesService, 'findAllClassInstances')
        .mockResolvedValue(expectedClassInstances);

      const result = await service.fetchMyClassInstances(lecturer);

      expect(result).toEqual(expectedClassInstances);
      expect(classesService.findAllClassInstances).toHaveBeenCalledWith({
        base: {
          course: {
            lecturer: {
              id: lecturer.id,
            },
          },
        },
      });
    });
  });
});
