import { IsDate } from 'class-validator';
import { Student } from '../../students/entities/student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity()
@Unique('student-course-unique', ['studentId', 'courseId'])
export class StudentCourseEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @CreateDateColumn({ select: false })
  @IsDate()
  created_at: Date;

  @UpdateDateColumn({ select: false })
  @IsDate()
  updated_at: Date;
}
