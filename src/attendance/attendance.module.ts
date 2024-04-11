import { forwardRef, Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClassesModule } from '../classes/classes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    forwardRef(() => ClassesModule),
    forwardRef(() => CoursesModule),
  ],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
