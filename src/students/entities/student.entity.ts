import { Column, Entity } from 'typeorm';
import { Profile } from '../../common/entities/profile.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Student extends Profile {
  constructor(partial: Partial<Student>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ unique: true })
  @IsNotEmpty()
  matric_no: string;
}
