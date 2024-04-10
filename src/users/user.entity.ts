import {
  ArrayNotEmpty,
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  validateOrReject,
} from 'class-validator';
import { Factory } from 'nestjs-seeder';
import { Role } from '../constants/enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsCustomStrongPassword } from './strong-password.decorator';

@Entity()
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Factory((faker) => faker.internet.userName())
  @Column({ unique: true })
  @IsNotEmpty()
  username: string;

  @Factory((faker) => faker.internet.email())
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Factory((faker) => faker.internet.password())
  @Column()
  @IsNotEmpty()
  @IsCustomStrongPassword()
  @Exclude()
  password: string;

  @Factory((faker) => faker.helpers.arrayElements(Object.values(Role)))
  @Column({ type: 'enum', enum: Role, array: true })
  @ArrayUnique()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];

  @Column({ nullable: true, unique: true, select: false })
  @IsOptional()
  @IsNotEmpty()
  fcm_token?: string;

  @CreateDateColumn({ select: false })
  created_at: Date;

  @UpdateDateColumn({ select: false })
  updated_at: Date;

  // HOOKS
  @BeforeInsert()
  @BeforeUpdate()
  async validateUser?() {
    await validateOrReject(this, {
      skipMissingProperties: true,
    });
  }
}
