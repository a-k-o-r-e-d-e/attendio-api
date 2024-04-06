import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCourseClassDto } from './create-class.dto';
import { IsDateString, IsString, IsUrl, ValidateIf } from 'class-validator';
import { ClassMode } from '../../constants/enums';
import { IsValidStartDate } from '../../common/decorators/valid_start_date.decorator';

export class UpdateCourseClassDto extends PartialType(
  OmitType(CreateCourseClassDto, ['courseId', 'frequency', 'start_date']),
) {
  @ValidateIf((o: CreateCourseClassDto) => o.mode === ClassMode.Physical)
  @IsString()
  venue?: string;

  @ValidateIf((o: CreateCourseClassDto) => o.mode === ClassMode.Online)
  @IsUrl()
  class_link?: string;

  @IsDateString()
  @IsValidStartDate()
  start_date?: Date;
}
