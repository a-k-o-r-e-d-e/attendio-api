import { IsEnum, IsNotEmpty } from 'class-validator';
import { InstitutionType } from '../constants/enums';
import { Entity, Column } from 'typeorm';
import { CustomBaseEntity } from 'src/common/entities/base.entity';

@Entity()
export class Institution extends CustomBaseEntity {
  @Column({ unique: true })
  @IsNotEmpty()
  name: string;

  @Column({ unique: true })
  @IsNotEmpty()
  abbreviation: string;

  @Column({ type: 'enum', enum: InstitutionType })
  @IsEnum(InstitutionType)
  type: InstitutionType;

  @Column()
  @IsNotEmpty()
  city: string;

  @Column()
  @IsNotEmpty()
  state: string;

  @Column()
  @IsNotEmpty()
  country: string;
}
