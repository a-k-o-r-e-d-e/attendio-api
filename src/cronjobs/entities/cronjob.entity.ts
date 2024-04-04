import { IsDefined, validateOrReject } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CronJobFreq } from '../../constants/enums';

@Entity()
@Unique(['frequency', 'date'])
export class CronJob {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ nullable: false, type: 'enum', enum: CronJobFreq })
  @IsDefined()
  frequency!: CronJobFreq;

  @Column({ nullable: false, type: 'date', default: () => 'CURRENT_DATE' })
  @IsDefined()
  date!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // HOOKS
  @BeforeInsert()
  @BeforeUpdate()
  async validateUser?() {
    await validateOrReject(this, { skipMissingProperties: true });
  }
}
