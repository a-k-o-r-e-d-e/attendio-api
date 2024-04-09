import { IsEnum, IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { CourseCategory } from '../../constants/enums';
import { Institution } from '../../institutions/insititution.entity';
import { Lecturer } from '../../lecturers/lecturer.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { StudentCourseEnrollment } from './student-course-enrollment.entity';
import { CourseClass } from '../../classes/entities/course-class.entity';
import { VirtualColumn } from '../../database/custom-decorators';
import { CustomBaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Course extends CustomBaseEntity {
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

  @Column({ default: 70.0 })
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
  classes: CourseClass[];

  @VirtualColumn()
  is_student_enrolled?: boolean;
}
