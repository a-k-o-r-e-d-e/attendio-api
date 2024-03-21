import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, [
    'user',
    'first_name',
    'last_name',
    'institution',
    'matric_no',
  ]),
) {
  @IsOptional()
  @ValidateNested({})
  @Type(() => UpdateUserDto)
  user?: UpdateUserDto;
}
