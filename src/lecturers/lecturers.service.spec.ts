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

describe('LecturersService', () => {
  let service: LecturersService;
  let repository: Repository<Lecturer>;
  let institutionService: InstitutionsService;

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
            getById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LecturersService>(LecturersService);
    repository = module.get<Repository<Lecturer>>(getRepositoryToken(Lecturer));
    institutionService = module.get<InstitutionsService>(InstitutionsService);
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

  describe('getById', () => {
    it('should return a lecturer by ID if found', async () => {
      const lecturerId = '123';
      const expectedLecturer: Lecturer = buildLecturerMock({ id: lecturerId });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(expectedLecturer);

      const result = await service.getById(lecturerId);

      expect(result).toEqual(expectedLecturer);
    });

    it('should throw NotFoundException if lecturer with ID is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.getById('123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getByEmail', () => {
    it('should return a lecturer by email if found', async () => {
      const testEmail = 'test@example.com';
      const expectedLecturer: Lecturer = buildLecturerMock({
        user: { email: testEmail },
      });
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(expectedLecturer);

      const result = await service.getByEmail(testEmail);

      expect(result).toEqual(expectedLecturer);
    });

    it('should throw NotFoundException if lecturer with email is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined);

      await expect(service.getByEmail('test@example.com')).rejects.toThrow(
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

      const result = await service.getByUsername(username);

      expect(result).toEqual(expectedLecturer);
    });

    it('should throw NotFoundException if lecturer with username is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(undefined);

      await expect(service.getByUsername('testuser')).rejects.toThrow(
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
});
