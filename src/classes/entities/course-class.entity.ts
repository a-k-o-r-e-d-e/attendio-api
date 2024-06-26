import {
  IsDate,
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinDate,
} from 'class-validator';
import { ClassMode, ClassFrequency } from '../../constants/enums';
import { Course } from '../../courses/entities/course.entity';
import { Column, Entity, ManyToOne, OneToMany, Unique } from 'typeorm';
import { ClassInstance } from './class-instance.entity';
import { CustomBaseEntity } from '../../common/entities/base.entity';

@Entity()
@Unique('unique_class_course', ['course', 'start_date', 'start_time'])
export class CourseClass extends CustomBaseEntity {
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
  // @MinDate(new Date())
  start_date: Date;

  @Column({ type: 'date' })
  // @MinDate(new Date())
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
  instances: ClassInstance[];
}
