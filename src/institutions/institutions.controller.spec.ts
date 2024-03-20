import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsController } from './institutions.controller';
import { InstitutionsService } from './institutions.service';
import { InstitutionType } from '../constants/enums';

describe('InstitutionsController', () => {
  let controller: InstitutionsController;
  let service: InstitutionsService;
  let mockInstitution = {
    id: '1',
    name: 'Test Institution',
    abbreviation: 'TI',
    type: InstitutionType.University,
    city: 'Test City',
    state: 'Test State',
    country: 'Test Country',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstitutionsController],
      providers: [
        {
          provide: InstitutionsService,
          useValue: {
            findAll: jest.fn(),
            searchByName: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InstitutionsController>(InstitutionsController);
    service = module.get<InstitutionsService>(InstitutionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call institutionService.findAll', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an array of institutions', async () => {
      const institutions = [mockInstitution];
      jest.spyOn(service, 'findAll').mockResolvedValue(institutions);
      expect(await controller.findAll()).toBe(institutions);
    });
  });

  describe('searchByName', () => {
    it('should call institutionService.searchByName with provided name', async () => {
      const name = 'Test';
      await controller.searchByName(name);
      expect(service.searchByName).toHaveBeenCalledWith(name);
    });
    
    it('should return institutions matching the provided name', async () => {
      const searchText = 'test';
      const institutions = [mockInstitution];
      jest.spyOn(service, 'searchByName').mockResolvedValue(institutions);
      expect(await controller.searchByName(searchText)).toBe(institutions);
    });
  });
});
