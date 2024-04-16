import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    private readonly attendanceRepo: Repository<Attendance>,
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
      return this.attendanceRepo.create({
        class_instance: classInstance,
        student_enrollment: studentEnrollment,
        is_present: false,
      });
    });

    await this.attendanceRepo.upsert(attendanceRecords, {
      conflictPaths: { studentEnrollmentId: true, classInstanceId: true },
      skipUpdateIfNoValuesChanged: true,
    });

    return this.attendanceRepo.findBy({
      class_instance: { id: classInstance.id },
    });
  }

  async findAttendanceRecord(
    studentEnrollment: StudentCourseEnrollment,
    classInstance: ClassInstance,
    throwOnNotFound: boolean = true,
  ) {
    const attendanceRecord = await this.attendanceRepo.findOneBy({
      class_instance: { id: classInstance.id },
      student_enrollment: {
        id: studentEnrollment.id,
      },
    });

    if (!attendanceRecord && throwOnNotFound) {
      throw new NotFoundException('No Attendance Record Found');
    }

    return attendanceRecord;
  }

  async findOrCreateAttendanceRecord(
    studentEnrollment: StudentCourseEnrollment,
    classInstance: ClassInstance,
  ) {
    let attendanceRecord = await this.findAttendanceRecord(
      studentEnrollment,
      classInstance,
      false,
    );

    if (!attendanceRecord) {
      attendanceRecord = await this.attendanceRepo.save(
        this.attendanceRepo.create({
          class_instance: classInstance,
          student_enrollment: studentEnrollment,
          is_present: false,
        }),
      );
    }

    return attendanceRecord;
  }

  async fetchAttendaceRecords(classInstance: ClassInstance) {
    return await this.attendanceRepo.findBy({
      class_instance: { id: classInstance.id },
    });
  }

  async markStudentPresent(
    studentEnrollment: StudentCourseEnrollment,
    classInstance: ClassInstance,
  ) {
    let attendanceRecord = await this.findOrCreateAttendanceRecord(
      studentEnrollment,
      classInstance,
    );
    attendanceRecord.is_present = true;
    return await this.attendanceRepo.save(attendanceRecord);
  }
}
