import { Module } from '@nestjs/common';
import { DevService } from './dev.service';
import { DevController } from './dev.controller';
import { LecturersModule } from 'src/lecturers/lecturers.module';
import { StudentsModule } from 'src/students/students.module';

@Module({
  imports: [LecturersModule, StudentsModule],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
