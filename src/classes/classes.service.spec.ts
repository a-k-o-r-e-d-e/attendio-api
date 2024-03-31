import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CourseClass } from './entities/course-class.entity';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesService } from '../courses/courses.service';
import { buildClassInstanceMock, buildCourseClassMock } from '../test/course-class.factory';

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
      const result = await service.findAllClassesInstances();

      // Assert
      expect(result).toEqual(expectedClassInstances);
      expect(classInstanceRepo.findBy).toHaveBeenCalledWith(undefined);
    });

    it('should find course classes with a provided whereClause', async () => {
      // Arrange
      const whereClause = {
        
      };
      const expectedClassInstances = [
        buildClassInstanceMock(),
        buildClassInstanceMock(),
      ];
      jest
        .spyOn(classInstanceRepo, 'findBy')
        .mockResolvedValueOnce(expectedClassInstances);

      // Act
      const result = await service.findAllClassesInstances(whereClause);

      // Assert
      expect(result).toEqual(expectedClassInstances);
      expect(classInstanceRepo.findBy).toHaveBeenCalledWith(whereClause);
    });
  });
});
