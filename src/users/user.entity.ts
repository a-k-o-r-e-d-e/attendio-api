import { IsEmail, IsEnum, IsNotEmpty, ValidateIf, validateOrReject } from 'class-validator';
import { Factory } from 'nestjs-seeder';
import { Role } from '../constants/enums';
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Factory((faker) => faker.internet.userName())
  @Column()
  @IsNotEmpty()
  username: string;

  @Factory((faker) => faker.internet.email())
  @Column({ nullable: true })
  @IsEmail()
  @ValidateIf((_, value) => value !== null)
  email: string | null;

  @Factory((faker) => faker.internet.password())
  @Column()
  @IsNotEmpty()
  password: string;

  @Factory((faker) => faker.helpers.arrayElement(Object.values(Role)))
  @Column({ type: 'enum', enum: Role })
  @IsEnum(Role)
  type: Role;

  // HOOKS
  @BeforeInsert()
  @BeforeUpdate()
  async validateUser?() {
    await validateOrReject(this, {
      skipMissingProperties: true,
      forbidUnknownValues: false,
    });
  }
}
