import { forwardRef, Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturersModule } from '../lecturers/lecturers.module';
import { StudentCourseEnrollment } from './entities/student-course-enrollment.entity';
import { StudentsModule } from '../students/students.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentCourseEnrollment, Course]),
    forwardRef(() => LecturersModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => ClassesModule),
  ],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
