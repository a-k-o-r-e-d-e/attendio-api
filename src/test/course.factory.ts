import { Course } from '../courses/entities/course.entity';
import { buildInstitutionMock } from './institution.factory';
import { buildLecturerMock } from './lecturer.factory';
import { CourseCategory } from '../constants/enums';
import { CreateCourseDto } from '../courses/dto/create-course.dto';
import { UpdateCourseDto } from '../courses/dto/update-course.dto';

export function buildCourseMock(partial?: Partial<Course>): Course {
  return {
    id: 'mock_course_id',
    title: 'Mock Course',
    course_code: 'CSE101',
    category: CourseCategory.Required,
    unit: 3,
    session: '2023/2024',
    min_attendance_percentage: 80,
    description: 'This is a mock course description.',
    created_at: new Date(),
    updated_at: new Date(),
    studentsEnrollments: [],
    ...partial,
    lecturer: {
      ...buildLecturerMock(partial?.lecturer),
    },
    institution: {
      ...buildInstitutionMock(partial?.institution),
    },
  };
}

export function buildCreateCourseDtoMock(
  partial?: Partial<CreateCourseDto>,
): CreateCourseDto {
  return {
    title: 'Mock Course',
    course_code: 'CS101',
    category: CourseCategory.Required,
    unit: 3,
    session: '2024/2025',
    min_attendance_percentage: 80,
    description: 'Mock Course Description',
    ...partial,
  };
}

export function buildUpdateCourseDtoMock(
  partial: Partial<UpdateCourseDto>,
): UpdateCourseDto {
  return {
    ...partial,
  };
}
