import { Module } from '@nestjs/common';
import { DevService } from './dev.service';
import { DevController } from './dev.controller';
import { LecturersModule } from 'src/lecturers/lecturers.module';

@Module({
  imports: [LecturersModule],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
