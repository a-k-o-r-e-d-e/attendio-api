import { Test, TestingModule } from '@nestjs/testing';
import { ClassesService } from './classes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CourseClass } from './entities/course-class.entity';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesService } from '../courses/courses.service';

describe('ClassesService', () => {
  let service: ClassesService;

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
            save: jest.fn()
          },
        },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
