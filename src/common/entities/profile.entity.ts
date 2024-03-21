import {
  IsDate,
  IsNotEmpty,
  IsPhoneNumber,
  validateOrReject,
} from 'class-validator';
import { User } from '../../users/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Institution } from '../../institutions/insititution.entity';

export abstract class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  title: string;

  @Column()
  @IsNotEmpty()
  first_name: string;

  @Column()
  @IsNotEmpty()
  last_name: string;

  @Column()
  @IsNotEmpty()
  gender: string;

  @Column()
  @IsPhoneNumber('NG')
  phone_number: string;

  @OneToOne(() => User, {
    cascade: true,
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Institution, {
    cascade: false,
    eager: true, 
    nullable: false,
    onDelete: 'RESTRICT'
  })
  institution: Institution;

  @Column()
  @IsNotEmpty()
  department: string;

  @Column()
  @IsNotEmpty()
  faculty: string;

  @CreateDateColumn({ select: false })
  @IsDate()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  @IsDate()
  updated_at: Date;

  // HOOKS
  @BeforeInsert()
  @BeforeUpdate()
  async validateUser?() {
    await validateOrReject(this, {
      skipMissingProperties: true,
    });
  }
}
