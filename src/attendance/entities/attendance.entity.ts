import { ClassInstance } from 'src/classes/entities/class-instance.entity';
import { CustomBaseEntity } from 'src/common/entities/base.entity';
import { StudentCourseEnrollment } from 'src/courses/entities/student-course-enrollment.entity';
import { Entity, ManyToOne } from 'typeorm';

@Entity()
export class Attendance extends CustomBaseEntity {
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
}
