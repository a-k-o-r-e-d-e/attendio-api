import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCourseClassDto } from './create-class.dto';

export class UpdateCourseClassDto extends PartialType(
  OmitType(CreateCourseClassDto, ['courseId']),
) {}
