import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LecturersModule } from '../lecturers/lecturers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), LecturersModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule {}
