import '../test/mocks/firebase.mock';
import { TestBed } from '@automock/jest';
import { AttendanceService } from './attendance.service';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { buildClassInstanceMock } from '../test/course-class.factory';
import { buildStudentCourseEnrollmentMock } from '../test/course.factory';
import { buildAttendanceMock } from '../test/attendance.factory';
import { NotFoundException } from '@nestjs/common';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendanceRepo: Repository<Attendance>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AttendanceService).compile();

    service = unit;
    attendanceRepo = unitRef.get(
      getRepositoryToken(Attendance) as string,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('populateAttendanceRecords', () => {
    it('should populate attendance records for each student enrollment and return the attendance records', async () => {
      // Arrange
      const classInstance = buildClassInstanceMock({
        id: '1',
        date: new Date(),
      });
      const studentEnrollments = [
        buildStudentCourseEnrollmentMock({ id: 'student-e-1' }),
        buildStudentCourseEnrollmentMock({ id: 'student-e-2' }),
      ];
      const attendanceRecords: Attendance[] = [
        buildAttendanceMock({
          id: '1',
          class_instance: classInstance,
          student_enrollment: studentEnrollments[0],
        }),
        buildAttendanceMock({
          id: '2',
          class_instance: classInstance,
          student_enrollment: studentEnrollments[1],
        }),
      ];

      attendanceRepo.create = jest
        .fn()
        .mockReturnValueOnce(attendanceRecords[0])
        .mockReturnValueOnce(attendanceRecords[1]);
      attendanceRepo.upsert = jest
        .fn()
        .mockResolvedValue(attendanceRecords);
      attendanceRepo.findBy = jest
        .fn()
        .mockResolvedValue(attendanceRecords);

      // Act
      const result = await service.populateAttendanceRecords(
        classInstance,
        studentEnrollments,
      );

      // Assert
      expect(result).toEqual(attendanceRecords);
      expect(attendanceRepo.create).toHaveBeenCalledTimes(
        studentEnrollments.length,
      );
      expect(attendanceRepo.upsert).toHaveBeenCalledWith(
        attendanceRecords,
        {
          conflictPaths: { studentEnrollmentId: true, classInstanceId: true },
          skipUpdateIfNoValuesChanged: true,
        },
      );
      expect(attendanceRepo.findBy).toHaveBeenCalledWith({
        class_instance: { id: classInstance.id },
      });
    });
  });

  describe('findAttendanceRecord', () => {
    it('should find and return attendance record if it exists', async () => {
      // Arrange
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const classInstance = buildClassInstanceMock();
      const attendanceRecord = buildAttendanceMock();
      jest
        .spyOn(attendanceRepo, 'findOneBy')
        .mockResolvedValueOnce(attendanceRecord);

      // Act
      const result = await service.findAttendanceRecord(
        studentEnrollment,
        classInstance,
      );

      // Assert
      expect(result).toEqual(attendanceRecord);
      expect(attendanceRepo.findOneBy).toHaveBeenCalledWith({
        class_instance: { id: classInstance.id },
        student_enrollment: { id: studentEnrollment.id },
      });
    });

    it('should throw NotFoundException if attendance record does not exist and throwOnNotFound is true', async () => {
      // Arrange
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const classInstance = buildClassInstanceMock();
      jest.spyOn(attendanceRepo, 'findOneBy').mockResolvedValueOnce(undefined);

      // Act & Assert
      await expect(
        service.findAttendanceRecord(studentEnrollment, classInstance),
      ).rejects.toThrow(NotFoundException);
      expect(attendanceRepo.findOneBy).toHaveBeenCalledWith({
        class_instance: { id: classInstance.id },
        student_enrollment: { id: studentEnrollment.id },
      });
    });

    it('should return null if attendance record does not exist and throwOnNotFound is false', async () => {
      // Arrange
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const classInstance = buildClassInstanceMock();
      jest.spyOn(attendanceRepo, 'findOneBy').mockResolvedValueOnce(undefined);

      // Act
      const result = await service.findAttendanceRecord(
        studentEnrollment,
        classInstance,
        false,
      );

      // Assert
      expect(result).toBeUndefined();
      expect(attendanceRepo.findOneBy).toHaveBeenCalledWith({
        class_instance: { id: classInstance.id },
        student_enrollment: { id: studentEnrollment.id },
      });
    });
  });

  describe('findOrCreateAttendanceRecord', () => {
    it('should return existing attendance record if it exists', async () => {
      // Arrange
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const classInstance = buildClassInstanceMock();
      const existingAttendanceRecord = buildAttendanceMock();
      
      jest
        .spyOn(service, 'findAttendanceRecord')
        .mockResolvedValueOnce(existingAttendanceRecord);

      // Act
      const result = await service.findOrCreateAttendanceRecord(
        studentEnrollment,
        classInstance,
      );

      // Assert
      expect(result).toEqual(existingAttendanceRecord);
      expect(attendanceRepo.save).not.toHaveBeenCalled();
      expect(attendanceRepo.create).not.toHaveBeenCalled();
    });

    it('should create and return new attendance record if it does not exist', async () => {
      // Arrange
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const classInstance = buildClassInstanceMock();
      const createdAttendanceRecord = buildAttendanceMock();
      jest.spyOn(service, 'findAttendanceRecord').mockResolvedValueOnce(null);
      
      jest
        .spyOn(attendanceRepo, 'save')
        .mockResolvedValueOnce(createdAttendanceRecord);

      // Act
      const result = await service.findOrCreateAttendanceRecord(
        studentEnrollment,
        classInstance,
      );

      // Assert
      expect(result).toEqual(createdAttendanceRecord);
      expect(attendanceRepo.save).toHaveBeenCalled(
      );
      expect(attendanceRepo.create).toHaveBeenCalled();
    });
  });

  describe('fetchAttendanceRecords', () => {
    it('should fetch attendance records for the given class instance', async () => {
      // Arrange
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const classInstance = buildClassInstanceMock();
      
      const attendanceRecords = [
        buildAttendanceMock(),
        buildAttendanceMock(),
      ];
      jest
        .spyOn(attendanceRepo, 'findBy')
        .mockResolvedValueOnce(attendanceRecords);

      // Act
      const result = await service.fetchAttendaceRecords(classInstance);

      // Assert
      expect(result).toEqual(attendanceRecords);
      expect(attendanceRepo.findBy).toHaveBeenCalledWith({
        class_instance: { id: classInstance.id },
      });
    });
  });

  describe('markStudentPresent', () => {
    it('should mark the student present for the given class instance', async () => {
      // Arrange
      const studentEnrollment = buildStudentCourseEnrollmentMock();
      const classInstance = buildClassInstanceMock();
      const attendanceRecord = buildAttendanceMock();

      jest
        .spyOn(service, 'findOrCreateAttendanceRecord')
        .mockResolvedValueOnce(attendanceRecord);
      jest
        .spyOn(attendanceRepo, 'save')
        .mockResolvedValueOnce(attendanceRecord);

      // Act
      const result = await service.markStudentPresent(
        studentEnrollment,
        classInstance,
      );

      // Assert
      expect(result).toEqual(attendanceRecord);
      expect(attendanceRecord.is_present).toBe(true);
      expect(attendanceRepo.save).toHaveBeenCalledWith(attendanceRecord);
    });
  });
});
