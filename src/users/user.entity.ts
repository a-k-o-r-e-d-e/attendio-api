import {
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsStrongPassword,
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
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
  @Exclude()
  password: string;

  @Factory((faker) => faker.helpers.arrayElements(Object.values(Role)))
  @Column({ type: 'enum', enum: Role, array: true })
  @ArrayUnique()
  @IsEnum(Role, { each: true })
  roles: Role[];

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
