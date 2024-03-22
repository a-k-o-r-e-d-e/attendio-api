import { Module } from '@nestjs/common';
import { DevService } from './dev.service';
import { DevController } from './dev.controller';
import { LecturersModule } from '../lecturers/lecturers.module';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [LecturersModule, StudentsModule],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
