import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { ClassesService } from '../classes/classes.service';
import { CoursesService } from '../courses/courses.service';
import { ClassInstance } from '../classes/entities/class-instance.entity';
import { StudentCourseEnrollment } from '../courses/entities/student-course-enrollment.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
    @Inject(forwardRef(() => CoursesService))
    private readonly coursesService: CoursesService,
  ) {}

  async populateAttendanceRecords(
    classInstance: ClassInstance,
    studentEnrollments: StudentCourseEnrollment[],
  ) {
    const attendanceRecords = studentEnrollments.map((studentEnrollment) => {
      return this.attendanceRepository.create({
        class_instance: classInstance,
        student_enrollment: studentEnrollment,
        is_present: false
      });
    });

    await this.attendanceRepository.upsert(attendanceRecords, {
      conflictPaths: { studentEnrollmentId: true, classInstanceId: true },
      skipUpdateIfNoValuesChanged: true,
    });

    return this.attendanceRepository.findBy({
      class_instance: { id: classInstance.id },
    });
  }
}
