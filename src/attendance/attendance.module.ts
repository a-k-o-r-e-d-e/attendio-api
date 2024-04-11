import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ClassesModule } from 'src/classes/classes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { CoursesModule } from 'src/courses/courses.module';
import { AttendanceGateway } from './attendance.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), ClassesModule, CoursesModule],
  providers: [AttendanceService, AttendanceGateway],
  exports: [AttendanceService]
})
export class AttendanceModule {}
