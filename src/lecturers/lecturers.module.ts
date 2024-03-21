import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecturer } from './lecturer.entity';
import { LecturersController } from './lecturers.controller';
import { LecturersService } from './lecturers.service';
import { InstitutionsModule } from '../institutions/institutions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lecturer]), InstitutionsModule],
  controllers: [LecturersController],
  providers: [LecturersService],
  exports: [LecturersService]
})
export class LecturersModule {}
