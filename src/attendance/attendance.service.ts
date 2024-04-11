import { Inject, Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { Repository } from 'typeorm';
import { ClassesService } from 'src/classes/classes.service';
import { Student } from 'src/students/entities/student.entity';
import { CoursesService } from 'src/courses/courses.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    // @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
    private readonly coursesService: CoursesService
  ) {}
}
