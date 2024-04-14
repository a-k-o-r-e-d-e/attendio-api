import { CustomBaseEntity } from "../../common/entities/base.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne } from "typeorm";
import { ClassInstance } from "./class-instance.entity";
import { StudentCourseEnrollment } from "../../courses/entities/student-course-enrollment.entity";

@Entity()
export class OnGoingingClassInstance extends CustomBaseEntity {
  @OneToOne(() => ClassInstance, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  class_instance: ClassInstance;

  @ManyToMany(() => StudentCourseEnrollment, {eager: true})
  @JoinTable()
  present_enrolled_students: StudentCourseEnrollment[];

  @Column({default: false})
  currently_taking_attendance: boolean;

  count_of_enrolled_students?: number;
}