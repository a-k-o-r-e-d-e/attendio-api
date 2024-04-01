import {
  IsDateString,
  IsEnum,
  IsMilitaryTime,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ClassFrequency, ClassMode } from '../../constants/enums';

export class CreateCourseClassDto {
  @IsNotEmpty()
  title: string;

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
  start_time: string;

  @IsMilitaryTime()
  end_time: string;

  @IsDateString()
  start_date: Date;

  @IsDateString()
  end_date: Date;

  @IsUUID()
  courseId: string;
}
