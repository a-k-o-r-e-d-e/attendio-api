import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecturer } from './lecturer.entity';
import { LecturersController } from './lecturers.controller';
import { LecturersService } from './lecturers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lecturer])],
  controllers: [LecturersController],
  providers: [LecturersService],
  exports: [LecturersService]
})
export class LecturersModule {}
