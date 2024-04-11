import { Attendance } from '../attendance/entities/attendance.entity';
import { buildClassInstanceMock } from './course-class.factory';
import { buildStudentCourseEnrollmentMock } from './course.factory';

export const buildAttendanceMock = (
  partial?: Partial<Attendance>,
): Attendance => {
  return {
    id: '1',
    classInstanceId: 'random-class-ins-id',
    studentEnrollmentId: 'student-enrollment-id',
    is_present: false,
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
    class_instance: {
      ...buildClassInstanceMock(partial.class_instance),
    },
    student_enrollment: {
      ...buildStudentCourseEnrollmentMock(partial.student_enrollment),
    },
  };
};
