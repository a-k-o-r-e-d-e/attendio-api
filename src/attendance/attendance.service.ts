import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { ClassesService } from 'src/classes/classes.service';
import { Student } from 'src/students/entities/student.entity';
import { CoursesService } from 'src/courses/courses.service';
import { ClassInstance } from 'src/classes/entities/class-instance.entity';
import { StudentCourseEnrollment } from 'src/courses/entities/student-course-enrollment.entity';

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
