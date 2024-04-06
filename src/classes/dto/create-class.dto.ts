import {
  IsDateString,
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ClassFrequency, ClassMode } from '../../constants/enums';
import { MinDateString } from '../../common/decorators/max_date_string.decorator';
import { IsValidStartDate } from '../../common/decorators/valid_start_date.decorator';
import { IsValidEndDate } from '../../common/decorators/valid-end-date.decorator';
import { IsValidStartTime } from '../../common/decorators/valid-start-time.decorator';

export class CreateCourseClassDto {
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  @IsEnum(ClassMode)
  mode: ClassMode;

  @IsEnum(ClassFrequency)
  frequency: ClassFrequency;

  @ValidateIf((o: CreateCourseClassDto) => o.mode === ClassMode.Physical)
  @IsString()
  venue?: string;

  @ValidateIf((o: CreateCourseClassDto) => o.mode === ClassMode.Online)
  @IsUrl()
  class_link?: string;

  @IsMilitaryTime()
  @IsValidStartTime()
  start_time: string;

  @IsMilitaryTime()
  end_time: string;

  @IsDateString()
  @MinDateString(new Date(), {message: "start_date cannot be in the past"})
  @IsValidStartDate()
  start_date: Date;

  @IsDateString()
  @IsValidEndDate()
  end_date: Date;

  @IsUUID()
  courseId: string;
}

