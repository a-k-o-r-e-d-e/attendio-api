import { Column, Entity, OneToMany } from 'typeorm';
import { Profile } from '../../common/entities/profile.entity';
import { IsNotEmpty } from 'class-validator';
import { StudentCourseEnrollment } from '../../courses/entities/student-course-enrollment.entity';

@Entity()
export class Student extends Profile {
  constructor(partial: Partial<Student>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ unique: true })
  @IsNotEmpty()
  matric_no: string;

  @OneToMany(
    () => StudentCourseEnrollment,
    (coursesEnrollment) => coursesEnrollment.student,
  )
  public coursesEnrollments: StudentCourseEnrollment[];
}
