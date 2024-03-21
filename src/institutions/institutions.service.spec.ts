import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsService } from './institutions.service';
import { Repository } from 'typeorm';
import { Institution } from './insititution.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InstitutionType } from '../constants/enums';

describe('InstitutionsService', () => {
  let service: InstitutionsService;
  let repository: Repository<Institution>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstitutionsService,
        {
          provide: getRepositoryToken(Institution),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<InstitutionsService>(InstitutionsService);
    repository = module.get<Repository<Institution>>(
      getRepositoryToken(Institution),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of institutions', async () => {
      const institutions: Institution[] = [
        {
          id: '1',
          name: 'Test Institution',
          abbreviation: 'TI',
          type: InstitutionType.University,
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(institutions);
      expect(await service.findAll()).toBe(institutions);
    });
  });

   describe('searchByName', () => {
    it('should return institutions matching the provided name', async () => {
      const searchText = 'test';
      const institutions: Institution[] = [
        { id: '1', name: 'Test Institution', abbreviation: 'TI', type: InstitutionType.University, city: 'Test City', state: 'Test State', country: 'Test Country', created_at: new Date(), updated_at: new Date() },
        { id: '2', name: 'Another Test Institution', abbreviation: 'ATI', type: InstitutionType.Polytechnic, city: 'Test City', state: 'Test State', country: 'Test Country', created_at: new Date(), updated_at: new Date() }
      ];
      jest.spyOn(repository, 'findBy').mockResolvedValue(institutions);
      expect(await service.searchByName(searchText)).toEqual(institutions);
    });

    it('should return empty array if no matching institutions found', async () => {
      const searchText = 'non-existent';
      jest.spyOn(repository, 'findBy').mockResolvedValue([]);
      expect(await service.searchByName(searchText)).toEqual([]);
    });

     it('should return institutions matching the provided name (case insensitive)', async () => {
       const searchText = 'test';
       const institutions: Institution[] = [
         {
           id: '1',
           name: 'Test Institution',
           abbreviation: 'TI',
           type: InstitutionType.University,
           city: 'Test City',
           state: 'Test State',
           country: 'Test Country',
           created_at: new Date(),
           updated_at: new Date(),
         },
         {
           id: '2',
           name: 'Another Test Institution',
           abbreviation: 'ATI',
           type: InstitutionType.Polytechnic,
           city: 'Test City',
           state: 'Test State',
           country: 'Test Country',
           created_at: new Date(),
           updated_at: new Date(),
         },
       ];
       jest
         .spyOn(repository, 'findBy')
         .mockImplementation(async (conditions) => {
           const filteredInstitutions = institutions.filter((institution) =>
             institution.name.toLowerCase().includes(searchText.toLowerCase()),
           );
           return filteredInstitutions;
         });
       expect(await service.searchByName(searchText)).toEqual(institutions);
       expect(await service.searchByName(searchText.toUpperCase())).toEqual(
         institutions,
       );
       expect(await service.searchByName(searchText.toLowerCase())).toEqual(
         institutions,
       );
       expect(await service.searchByName('TeSt')).toEqual(institutions);
     });
  })
});
