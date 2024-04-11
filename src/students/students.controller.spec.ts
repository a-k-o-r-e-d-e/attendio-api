import '../test/mocks/firebase.mock';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import {
  buildStudentMock,
  buildUpdateStudentDtoMock,
} from '../test/student.factory';
import { buildCourseMock } from '../test/course.factory';
import { buildClassInstanceMock } from '../test/course-class.factory';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [
        {
          provide: StudentsService,
          useValue: {
            update: jest.fn(),
            findOneById: jest.fn(),
            fetchMyCourses: jest.fn(),
            fetchMyClassInstances: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyProfile', () => {
    it('should return student by ID', async () => {
      const mockStudent = buildStudentMock();
      const req = { user: mockStudent };

      const result = await controller.getMyProfile(req);

      expect(result).toEqual(mockStudent);
    });
  });

  describe('findOneById', () => {
    it('should return a student by id', async () => {
      const studentId = 'student-id';
      const mockStudent = buildStudentMock({ id: studentId });

      jest.spyOn(service, 'findOneById').mockResolvedValueOnce(mockStudent);

      const result = await controller.findOneById(studentId);

      expect(result).toBe(mockStudent);
      expect(service.findOneById).toHaveBeenCalledWith(studentId);
    });
  });

  describe('editStudentProfile', () => {
    it('should update student profile', async () => {
      const mockStudent = buildStudentMock();
      const mockUpdateDto = buildUpdateStudentDtoMock({ title: 'Mrs' });
      const mockUpdatedStudent = buildStudentMock(mockUpdateDto);
      const req = { user: mockStudent };

      jest.spyOn(service, 'update').mockResolvedValueOnce(mockUpdatedStudent);

      const result = await controller.editStudentProfile(mockUpdateDto, req);

      expect(result).toEqual(mockUpdatedStudent);
      expect(service.update).toHaveBeenCalledWith(mockStudent, mockUpdateDto);
    });
  });

  describe('fetchMyCourses', () => {
    it('should fetch courses for a student', async () => {
      const student = buildStudentMock();
      const mockCourses = [buildCourseMock(), buildCourseMock()];
      jest.spyOn(service, 'fetchMyCourses').mockResolvedValueOnce(mockCourses);

      const result = await service.fetchMyCourses(student);

      expect(result).toBe(mockCourses);
    });
  });

  describe('fetchMyClassInstances', () => {
    it('should fetch classes for a student', async () => {
      const student = buildStudentMock();
      const mockClassInstances = [
        buildClassInstanceMock(),
        buildClassInstanceMock(),
      ];
      jest
        .spyOn(service, 'fetchMyClassInstances')
        .mockResolvedValueOnce(mockClassInstances);

      const result = await service.fetchMyClassInstances(student);

      expect(result).toBe(mockClassInstances);
    });
  });
});
