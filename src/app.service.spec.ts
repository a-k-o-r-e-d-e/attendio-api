import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { DataSource } from 'typeorm';

describe('AppService', () => {
  let service: AppService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: DataSource,
          useValue: {
            isInitialized: true, // Simulate database connection success
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(service.getHello()).toBe('Hello World!');
    });
  });
});
