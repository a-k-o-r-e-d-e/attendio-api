import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { CronJob } from './entities/cronjob.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [TypeOrmModule.forFeature([CronJob]), ClassesModule],
  providers: [CronjobsService],
  exports: [CronjobsService]
})
export class CronjobsModule {}
