import { Student } from '../../students/entities/student.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { Course } from './course.entity';
import { CustomBaseEntity } from '../../common/entities/base.entity';

@Entity()
@Unique('student-course-unique', ['studentId', 'courseId'])
export class StudentCourseEnrollment extends CustomBaseEntity {
  @Column()
  public studentId: string;

  @Column()
  public courseId: string;

  @ManyToOne(() => Student, (student) => student.coursesEnrollments, {
    eager: true,
    onDelete: 'CASCADE',
  })
  public student: Student;

  @ManyToOne(() => Course, (course) => course.studentsEnrollments, {
    onDelete: 'CASCADE',
  })
  public course: Course;
}
