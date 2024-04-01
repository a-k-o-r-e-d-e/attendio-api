import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CourseClass } from './entities/course-class.entity';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesService } from '../courses/courses.service';
import {
  buildClassInstanceMock,
  buildCourseClassMock,
} from '../test/course-class.factory';
import { NotFoundException } from '@nestjs/common';

describe('ClassesService', () => {
  let service: ClassesService;
  let courseClassRepo: Repository<CourseClass>;
  let classInstanceRepo: Repository<ClassInstance>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        {
          provide: getRepositoryToken(CourseClass),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ClassInstance),
          useClass: Repository,
        },
        {
          provide: CoursesService,
          useValue: {
            findOneById: jest.fn(),
          },
        },

        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: EntityManager,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
    courseClassRepo = module.get<Repository<CourseClass>>(
      getRepositoryToken(CourseClass),
    );
    classInstanceRepo = module.get<Repository<ClassInstance>>(
      getRepositoryToken(ClassInstance),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCourseClasses', () => {
    it('should find all course classes when no whereClause is provided', async () => {
      // Arrange
      const expectedCourseClasses: CourseClass[] = [
        buildCourseClassMock(),
        buildCourseClassMock(),
      ];
      jest
        .spyOn(courseClassRepo, 'findBy')
        .mockResolvedValueOnce(expectedCourseClasses);

      // Act
      const result = await service.findAllCourseClasses();

      // Assert
      expect(result).toEqual(expectedCourseClasses);
      expect(courseClassRepo.findBy).toHaveBeenCalledWith(undefined);
    });

    it('should find course classes with a provided whereClause', async () => {
      // Arrange
      const whereClause = {
        /* Add your whereClause here */
      };
      const expectedCourseClasses: CourseClass[] = [
        buildCourseClassMock(),
        buildCourseClassMock(),
      ];
      jest
        .spyOn(courseClassRepo, 'findBy')
        .mockResolvedValueOnce(expectedCourseClasses);

      // Act
      const result = await service.findAllCourseClasses(whereClause);

      // Assert
      expect(result).toEqual(expectedCourseClasses);
      expect(courseClassRepo.findBy).toHaveBeenCalledWith(whereClause);
    });
  });

  describe('findAllClassInstances', () => {
    it('should find all class instances when no whereClause is provided', async () => {
      // Arrange
      const expectedClassInstances = [
        buildClassInstanceMock(),
        buildClassInstanceMock(),
      ];
      jest
        .spyOn(classInstanceRepo, 'findBy')
        .mockResolvedValueOnce(expectedClassInstances);

      // Act
      const result = await service.findAllClassInstances();

      // Assert
      expect(result).toEqual(expectedClassInstances);
      expect(classInstanceRepo.findBy).toHaveBeenCalledWith(undefined);
    });

    it('should find course classes with a provided whereClause', async () => {
      // Arrange
      const whereClause = {};
      const expectedClassInstances = [
        buildClassInstanceMock(),
        buildClassInstanceMock(),
      ];
      jest
        .spyOn(classInstanceRepo, 'findBy')
        .mockResolvedValueOnce(expectedClassInstances);

      // Act
      const result = await service.findAllClassInstances(whereClause);

      // Assert
      expect(result).toEqual(expectedClassInstances);
      expect(classInstanceRepo.findBy).toHaveBeenCalledWith(whereClause);
    });
  });

  describe('findOneCourseClass', () => {
    it('should return a course class when found', async () => {
      const courseClassId = '123';
      const expectedCourseClass = buildCourseClassMock();
      jest
        .spyOn(courseClassRepo, 'findOneBy')
        .mockResolvedValue(expectedCourseClass);

      const result = await service.findOneCourseClass({ id: courseClassId });

      expect(result).toEqual(expectedCourseClass);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });

    it('should throw NotFoundException when course class is not found', async () => {
      const courseClassId = '123';
      jest.spyOn(courseClassRepo, 'findOneBy').mockResolvedValue(undefined);

      await expect(
        service.findOneCourseClass({ id: courseClassId }),
      ).rejects.toThrow(NotFoundException);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });
  });

  describe('findOneCourseClassById', () => {
    it('should return a course class when found', async () => {
      const courseClassId = '123';
      const expectedCourseClass = buildCourseClassMock();
      jest
        .spyOn(courseClassRepo, 'findOneBy')
        .mockResolvedValue(expectedCourseClass);

      const result = await service.findOneCourseClassById(courseClassId);

      expect(result).toEqual(expectedCourseClass);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });

    it('should throw NotFoundException when course class is not found', async () => {
      const courseClassId = '123';
      jest.spyOn(courseClassRepo, 'findOneBy').mockResolvedValue(undefined);

      await expect(
        service.findOneCourseClassById(courseClassId),
      ).rejects.toThrow(NotFoundException);
      expect(courseClassRepo.findOneBy).toHaveBeenCalledWith({
        id: courseClassId,
      });
    });
  });

  describe('remove', () => {
    it('should remove a course class when found', async () => {
      const courseClassId = '123';
      const expectedCourseClass = buildCourseClassMock();
      jest
        .spyOn(service, 'findOneCourseClassById')
        .mockResolvedValue(expectedCourseClass);
      jest.spyOn(courseClassRepo, 'delete').mockResolvedValueOnce(undefined);

      await service.remove(courseClassId);

      expect(courseClassRepo.delete).toHaveBeenCalledWith(courseClassId);
    });

    it('should throw NotFoundException when course class is not found', async () => {
      const courseClassId = '123';
      jest
        .spyOn(service, 'findOneCourseClassById')
        .mockResolvedValue(undefined);

      await expect(service.remove(courseClassId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
