import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLecturerDto } from './create-lecturer.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLecturerDto extends PartialType(
  OmitType(CreateLecturerDto, ['user', 'first_name', 'last_name']),
) {
  @IsOptional()
  @ValidateNested({})
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;
}
