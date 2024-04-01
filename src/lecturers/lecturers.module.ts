import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecturer } from './lecturer.entity';
import { LecturersController } from './lecturers.controller';
import { LecturersService } from './lecturers.service';
import { InstitutionsModule } from '../institutions/institutions.module';
import { CoursesModule } from '../courses/courses.module';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lecturer]),
    InstitutionsModule,
    forwardRef(() => CoursesModule),
    ClassesModule
  ],
  controllers: [LecturersController],
  providers: [LecturersService],
  exports: [LecturersService],
})
export class LecturersModule {}
