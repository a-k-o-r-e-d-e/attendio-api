import { Test, TestingModule } from '@nestjs/testing';
import { CronjobsService } from './cronjobs.service';
import { CronJob } from './entities/cronjob.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('CronjobsService', () => {
  let service: CronjobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CronjobsService,
        {
          provide: getRepositoryToken(CronJob),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CronjobsService>(CronjobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
