import { IsEmail, IsEnum, IsNotEmpty, ValidateIf, validateOrReject } from 'class-validator';
import { Factory } from 'nestjs-seeder';
import { Role } from '../constants/enums';
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Factory((faker) => faker.internet.userName())
  @Column({unique: true})
  @IsNotEmpty()
  username: string;

  @Factory((faker) => faker.internet.email())
  @Column({unique: true})
  @IsEmail()
  email: string;

  @Factory((faker) => faker.internet.password())
  @Column()
  @IsNotEmpty()
  password: string;

  @Factory((faker) => faker.helpers.arrayElement(Object.values(Role)))
  @Column({ type: 'enum', enum: Role })
  @IsEnum(Role)
  type: Role;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

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
