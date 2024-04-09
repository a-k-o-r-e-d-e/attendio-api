import { IsDate, validateOrReject } from 'class-validator';
import {
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class CustomBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ select: false })
  @IsDate()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  @IsDate()
  updated_at: Date;

  // HOOKS
  @BeforeInsert()
  @BeforeUpdate()
  async validateEntity?() {
    await validateOrReject(this, {
      skipMissingProperties: true,
    });
  }
}
