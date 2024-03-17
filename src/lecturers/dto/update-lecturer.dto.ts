import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLecturerDto } from './create-lecturer.dto';

export class UpdateUserDto extends PartialType(CreateLecturerDto) {}
