import { ClassInstance } from '../../classes/entities/class-instance.entity';
import { CustomBaseEntity } from '../../common/entities/base.entity';
import { StudentCourseEnrollment } from '../../courses/entities/student-course-enrollment.entity';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';

@Entity()
@Unique('unique-attendance', ['classInstanceId', 'studentEnrollmentId'])
export class Attendance extends CustomBaseEntity {
  @Column()
  public classInstanceId: string;

  @Column()
  public studentEnrollmentId: string;

  @ManyToOne(() => ClassInstance, {
    cascade: false,
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  class_instance: ClassInstance;

  @ManyToOne(() => StudentCourseEnrollment, {
    cascade: false,
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  student_enrollment: StudentCourseEnrollment;

  @Column()
  is_present: boolean;
}
