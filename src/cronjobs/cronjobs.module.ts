import { Module } from '@nestjs/common';
import { CronjobsService } from './cronjobs.service';
import { CronJob } from './entities/cronjob.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CronJob])],
  providers: [CronjobsService],
})
export class CronjobsModule {}
