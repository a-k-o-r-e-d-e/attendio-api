import {
  IsDate,
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ClassMode, ClassFrequency } from '../../constants/enums';
import { Course } from '../../courses/entities/course.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ClassInstance } from './class-instance.entity';

@Entity()
@Unique('unique_class_course', ['course', 'start_date', 'start_time'])
export class CourseClass {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  title: string;

  @Column({ type: 'enum', enum: ClassMode })
  @IsEnum(ClassMode)
  mode: ClassMode;

  @Column({ type: 'enum', enum: ClassFrequency })
  @IsEnum(ClassFrequency)
  frequency: ClassFrequency;

  @Column({ type: 'time' })
  @IsMilitaryTime()
  start_time: string;

  @Column({ type: 'time' })
  @IsMilitaryTime()
  end_time: string;

  @Column({ type: 'date' })
  @IsDate()
  start_date: Date;

  @Column({ type: 'date' })
  @IsDate()
  end_date: Date;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  venue?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl()
  class_link?: string;

  @ManyToOne(() => Course, {
    cascade: false,
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  course: Course;

  @OneToMany(() => ClassInstance, (instance) => instance.base)
  instances: ClassInstance[]

  @CreateDateColumn({ select: false })
  @IsDate()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  @IsDate()
  updated_at: Date;
}
