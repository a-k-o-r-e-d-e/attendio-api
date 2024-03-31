import { CreateCourseClassDto } from '../classes/dto/create-class.dto';
import { UpdateCourseClassDto } from '../classes/dto/update-class.dto';
import { ClassInstance } from '../classes/entities/class-instance.entity';
import { CourseClass } from '../classes/entities/course-class.entity';
import { ClassFrequency, ClassMode, ClassStatus } from '../constants/enums';
import { buildCourseMock } from './course.factory';

export function buildCourseClassMock(
  partial?: Partial<CourseClass>,
): CourseClass {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Mock Course Class',
    mode: ClassMode.Online,
    frequency: ClassFrequency.Weekly,
    start_time: '08:00:00',
    end_time: '10:00:00',
    start_date: new Date('2024-03-25'),
    end_date: new Date('2024-03-31'),
    venue: 'Online Venue',
    class_link: 'https://example.com/class-link',
    instances: [], // You may populate this with mock ClassInstance objects if needed
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
    course: {
      ...buildCourseMock(partial?.course),
    },
  };
}

export function buildClassInstanceMock(
  partial?: Partial<ClassInstance>,
): ClassInstance {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000', // Replace with valid UUID
    frequency: ClassStatus.Pending,
    date: new Date(),
    baseId: '123e4567-e89b-12d3-a456-426614174001', // Replace with valid UUID
    start_time: new Date('2024-03-25T08:00:00Z'),
    end_time: new Date('2024-03-25T10:00:00Z'),
    base: {
      ...buildCourseClassMock(partial?.base),
    },
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
  };
}

export function buildCreateCourseClassDtoMock(
  partial?: Partial<CreateCourseClassDto>,
): CreateCourseClassDto {
  return {
    title: 'Mock Course Class',
    mode: ClassMode.Physical,
    frequency: ClassFrequency.Weekly,
    venue: 'Mock Venue',
    start_time: '08:00',
    end_time: '10:00',
    start_date: new Date(),
    end_date: new Date(),
    courseId: '123e4567-e89b-12d3-a456-426614174000',
    ...partial,
  };
}

export function buildUpdateCourseClassDtoMock(
  partial: Partial<UpdateCourseClassDto>,
): UpdateCourseClassDto {
  return {
    ...partial,
  };
}
