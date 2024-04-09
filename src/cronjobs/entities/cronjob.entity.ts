import { IsDefined } from 'class-validator';
import { Column, Entity, Unique } from 'typeorm';
import { CronJobFreq } from '../../constants/enums';
import { CustomBaseEntity } from 'src/common/entities/base.entity';

@Entity()
@Unique(['frequency', 'date'])
export class CronJob extends CustomBaseEntity {
  @Column({ nullable: false, type: 'enum', enum: CronJobFreq })
  @IsDefined()
  frequency!: CronJobFreq;

  @Column({ nullable: false, type: 'date', default: () => 'CURRENT_DATE' })
  @IsDefined()
  date!: Date;
}
