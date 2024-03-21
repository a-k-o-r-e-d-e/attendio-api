import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLecturerDto } from './create-lecturer.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLecturerDto extends PartialType(
  OmitType(CreateLecturerDto, ['user', 'first_name', 'last_name', 'institution']),
) {
  @IsOptional()
  @ValidateNested({})
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;
}
