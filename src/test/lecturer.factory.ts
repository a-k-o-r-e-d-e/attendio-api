import { CreateLecturerDto } from '../lecturers/dto/create-lecturer.dto';
import { Lecturer } from '../lecturers/lecturer.entity';
import { User } from '../users/user.entity';
import { UpdateLecturerDto } from '../lecturers/dto/update-lecturer.dto';
import { buildUserMock } from './user.factory';
import { buildInstitutionMock } from './institution.factory';

interface LecturerPartial extends Partial<Omit<Lecturer, 'user'>> {
  user?: Partial<User>;
}

export function buildLecturerMock(partial?: LecturerPartial): Lecturer {
  return {
    id: '123e4567-e89b-12d3-a456-426614174001', // Mock lecturer UUID
    title: 'Dr.',
    first_name: 'John',
    last_name: 'Doe',
    gender: 'Male',
    phone_number: '1234567890',
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    created_at: new Date(),
    updated_at: new Date(),
    ...partial,
    user: {
      ...buildUserMock(partial?.user),
    },
    institution: {
      ...buildInstitutionMock(partial?.institution),
    },
  };
}

export function buildCreateLecturerDtoMock(
  partial?: Partial<CreateLecturerDto>,
): CreateLecturerDto {
  return {
    title: 'Dr.',
    first_name: 'John',
    last_name: 'Doe',
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

export function buildUpdateLecturerDtoMock(
  partial: Partial<UpdateLecturerDto>,
): UpdateLecturerDto {
  return {
    ...partial,
    user: {
      ...partial?.user,
    },
  };
}
