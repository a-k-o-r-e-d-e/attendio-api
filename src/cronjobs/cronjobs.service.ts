import { Injectable } from '@nestjs/common';
import { startOfWeek } from 'date-fns';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CronJob } from './entities/cronjob.entity';
import { DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { CronJobFreq } from '../constants/enums';
import { ClassesService } from 'src/classes/classes.service';

@Injectable()
export class CronjobsService {
  constructor(
    @InjectRepository(CronJob)
    private readonly cronJobRepository: Repository<CronJob>,
    private readonly classesService: ClassesService,
    private dataSource: DataSource,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async dailyCronJobs() {
    console.log('Attempting Daily Cron Jobs');
    try {
      const existingCron = await this.cronJobRepository.findOneBy({
        date: new Date(),
        frequency: CronJobFreq.Daily,
      });
      if (!existingCron) {
        console.log('No existing daily cron, Running Daily Cron Jobs');

        await this.cronJobRepository.insert({
          frequency: CronJobFreq.Daily,
        });
      } else {
        console.log('Daily Cron has already been run today, we do nothing');
      }
    } catch (err) {
      console.log('Error Running Daily Cron Job');
      console.log(err);
    }
  }

  @Cron('0 */12 * * *')
  async weeklyCronJobs() {
    console.log('Attempting Weekly Cron Jobs');
    try {
      const existingWeeklyCron = await this.cronJobRepository.findOneBy({
        date: MoreThanOrEqual(startOfWeek(new Date())),
        frequency: CronJobFreq.Weekly,
      });
      if (!existingWeeklyCron) {
        console.log('No existing weekly cron, Running weekly Cron Jobs');
        this.dataSource.transaction(async (transactionManager) => {
          await this.classesService.createCurrentWeekClassInstances(
            transactionManager,
          );
        });

        await this.cronJobRepository.insert({
          frequency: CronJobFreq.Weekly,
        });
      } else {
        console.log(
          'Weekly Cron has already been run this week, we do nothing',
        );
      }
    } catch (err) {
      console.log('Error Running Weekly Cron Job');
      console.log(err);
    }
  }
}
