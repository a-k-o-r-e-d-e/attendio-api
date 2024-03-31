import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { CourseCategory } from '../../constants/enums';
import { Institution } from '../../institutions/insititution.entity';
import { Lecturer } from '../../lecturers/lecturer.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentCourseEnrollment } from './student-course-enrollment.entity';
import { CourseClass } from '../../classes/entities/course-class.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @IsNotEmpty()
  title: string;

  @Column()
  @IsNotEmpty()
  course_code: string;

  @Column({ type: 'enum', enum: CourseCategory })
  @IsEnum(CourseCategory)
  category: CourseCategory;

  @Column()
  @IsInt()
  @Min(0)
  unit: number;

  @Column()
  @IsNotEmpty()
  session: string;

  @ManyToOne(() => Institution, {
    cascade: false,
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  institution: Institution;

  @ManyToOne(() => Lecturer, {
    cascade: false,
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  lecturer: Lecturer;

  @Column({default: 70.00})
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Max(100)
  @Min(0)
  min_attendance_percentage: number;

  @Column()
  @IsNotEmpty()
  description: string;

  @OneToMany(
    () => StudentCourseEnrollment,
    (studentsEnrollment) => studentsEnrollment.course,
  )
  public studentsEnrollments: StudentCourseEnrollment[];

  @OneToMany(() => CourseClass, (courseClass) => courseClass.course)
  classes : CourseClass[]

  @CreateDateColumn({ select: false })
  @IsDate()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  @IsDate()
  updated_at: Date;
}
