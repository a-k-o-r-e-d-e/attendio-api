import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { CourseCategory } from '../../constants/enums';

export class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  course_code: string;

  @IsEnum(CourseCategory)
  category: CourseCategory;

  @IsInt()
  @Min(0)
  unit: number;

  @IsNotEmpty()
  session: string;

  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 2 })
  @Max(100)
  @Min(0)
  min_attendance_percentage: number;

  @IsNotEmpty()
  description: string;
}
