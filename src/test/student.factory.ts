import { User } from '../users/user.entity';
import { Student } from '../students/entities/student.entity';
import { buildUserMock } from './user.factory';
import { buildInstitutionMock } from './institution.factory';
import { CreateStudentDto } from '../students/dto/create-student.dto';
import { UpdateStudentDto } from '../students/dto/update-student.dto';
import { Role } from '../constants/enums';

interface StudentPartial extends Partial<Omit<Student, 'user'>> {
  user?: Partial<User>;
}

export function buildStudentMock(partial?: StudentPartial): Student {
  return {
    id: '123e4567-e89b-12d3-a456-426614174001', // Mock student UUID
    title: 'Dr.',
    first_name: 'John',
    last_name: 'Doe',
    gender: 'Male',
    phone_number: '1234567890',
    matric_no: '12345678',
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
    user: {
      ...buildUserMock(partial?.user),
      roles: [Role.Student],
    },
    institution: {
      ...buildInstitutionMock(partial?.institution),
    },
  };
}


export function buildCreateStudentDtoMock(
  partial?: Partial<CreateStudentDto>,
): CreateStudentDto {
  return {
    title: 'Dr.',
    first_name: 'John',
    last_name: 'Doe',
    matric_no: '12345678',
    gender: 'Male',
    phone_number: '1234567890',
    institution: '123e4567-e89b-12d3-a456-426614174000', // Mock institution UUID
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    ...partial,
    user: {
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: 'Password@123',
      ...partial?.user,
    },
  };
}

export function buildUpdateStudentDtoMock(
  partial: Partial<UpdateStudentDto>,
): UpdateStudentDto {
  return {
    ...partial,
    user: {
      ...partial?.user,
    },
  };
}

