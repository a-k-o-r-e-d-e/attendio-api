import { IsDate, IsEnum } from 'class-validator';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { CourseClass } from './course-class.entity';
import { ClassStatus } from '../../constants/enums';
import { CustomBaseEntity } from 'src/common/entities/base.entity';

@Entity()
@Unique('date_class_constraint', ['date', 'baseId'])
export class ClassInstance extends CustomBaseEntity {
  @Column({ type: 'enum', enum: ClassStatus, default: ClassStatus.Pending })
  @IsEnum(ClassStatus)
  status: ClassStatus;

  @Column({ type: 'date' })
  @IsDate()
  date: Date;

  @Column()
  public baseId: string;

  @Column()
  @IsDate()
  start_time: Date;

  @Column()
  @IsDate()
  end_time: Date;

  @ManyToOne(() => CourseClass, (base) => base.instances, {
    cascade: false,
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  base: CourseClass;
}
