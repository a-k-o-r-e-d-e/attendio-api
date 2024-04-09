import { IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { User } from '../../users/user.entity';
import { Column, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Institution } from '../../institutions/insititution.entity';
import { CustomBaseEntity } from './base.entity';

export abstract class Profile extends CustomBaseEntity {
  @Column()
  @IsNotEmpty()
  title: string;

  @Column()
  @IsNotEmpty()
  first_name: string;

  @Column()
  @IsNotEmpty()
  last_name: string;

  @Column()
  @IsNotEmpty()
  gender: string;

  @Column()
  @IsPhoneNumber('NG')
  phone_number: string;

  @OneToOne(() => User, {
    cascade: true,
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Institution, {
    cascade: false,
    eager: true,
    nullable: false,
    onDelete: 'RESTRICT',
  })
  institution: Institution;

  @Column()
  @IsNotEmpty()
  department: string;

  @Column()
  @IsNotEmpty()
  faculty: string;
}
