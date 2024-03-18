import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLecturerDto } from './create-lecturer.dto';

export class UpdateLecturerDto extends PartialType(
  OmitType(CreateLecturerDto, [
    'password',
    'username',
    'first_name',
    'last_name',
  ]),
) {
    
}
