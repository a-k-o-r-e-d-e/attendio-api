import {
  ArrayNotEmpty,
  ArrayUnique,
  IsEmail,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { Factory } from 'nestjs-seeder';
import { Role } from '../constants/enums';
import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { IsCustomStrongPassword } from './strong-password.decorator';
import { CustomBaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class User extends CustomBaseEntity {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

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
}
