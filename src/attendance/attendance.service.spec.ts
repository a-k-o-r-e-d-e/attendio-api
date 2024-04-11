import { TestBed } from '@automock/jest';
import { AttendanceService } from './attendance.service';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { buildClassInstanceMock } from '../test/course-class.factory';
import { buildStudentCourseEnrollmentMock } from '../test/course.factory';
import { buildAttendanceMock } from '../test/attendance.factory';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let attendanceRepository: Repository<Attendance>;

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(AttendanceService).compile();

    service = unit;
    attendanceRepository = unitRef.get(
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

      attendanceRepository.create = jest
        .fn()
        .mockReturnValueOnce(attendanceRecords[0])
        .mockReturnValueOnce(attendanceRecords[1]);
      attendanceRepository.upsert = jest
        .fn()
        .mockResolvedValue(attendanceRecords);
      attendanceRepository.findBy = jest
        .fn()
        .mockResolvedValue(attendanceRecords);

      // Act
      const result = await service.populateAttendanceRecords(
        classInstance,
        studentEnrollments,
      );

      // Assert
      expect(result).toEqual(attendanceRecords);
      expect(attendanceRepository.create).toHaveBeenCalledTimes(
        studentEnrollments.length,
      );
      expect(attendanceRepository.upsert).toHaveBeenCalledWith(
        attendanceRecords,
        {
          conflictPaths: { studentEnrollmentId: true, classInstanceId: true },
          skipUpdateIfNoValuesChanged: true,
        },
      );
      expect(attendanceRepository.findBy).toHaveBeenCalledWith({
        class_instance: { id: classInstance.id },
      });
    });
  });
});
