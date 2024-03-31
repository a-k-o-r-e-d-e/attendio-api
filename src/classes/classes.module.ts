import { forwardRef, Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseClass } from './entities/course-class.entity';
import { ClassInstance } from './entities/class-instance.entity';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CourseClass, ClassInstance]),
    forwardRef(() => CoursesModule),
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
